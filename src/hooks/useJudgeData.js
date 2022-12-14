import { useState, useEffect } from "react";
import axios from "axios";

const instance = axios.create({
    baseURL: "https://script.google.com/macros/s/AKfycbwCXDPuRgblhbILJRBLh3PyY-bL69OIBOoPK5wpBmPwUT2ss2CGqM78iuHeveH6k7yQ/exec"
});
const queryData = async (path, dataSetter, defaultValue, handleFail) => {
    try {
        const {data} = await instance.get("/exec", {params: {path}});
        dataSetter(data);
    }
    catch(err) {
        console.error(err.message);
        if(handleFail) handleFail();
        dataSetter(defaultValue);
    }
};
const isDataReady = (...dataSets) => dataSets.every(data => Object.keys(data).length > 0);

export default function useJudgeData() {
    const [problems, setProblems] = useState({});
    const [homeworkSets, setHomeworkSets] = useState({});
    const [stats, setStats] = useState({});
    const [ready, setReady] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(undefined);
    useEffect(() => {
        queryData("get_problems", setProblems, {});
        queryData("get_homeworks", setHomeworkSets, {});
        queryData("get_log", setStats, {});

        const interval = setInterval(() => {
            queryData("get_log", setStats, {}, () => setReady(false));
        }, 1000*30);
        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        const isReady = isDataReady(problems, homeworkSets, stats);
        setReady(isReady);
        if(isReady) setLastUpdate(new Date());
    }, [problems, homeworkSets, stats]);
    return {problems, homeworkSets, stats, ready, lastUpdate};
};
