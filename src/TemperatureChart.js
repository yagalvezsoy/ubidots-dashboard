import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

const TOKEN = "BBUS-dN9Bwva8RfVdgwISjCdGcOiJ3aIAiB";
const DEVICE_LABEL = "sensorTemp";
const VARIABLE_LABEL = "temperature";
const URL = `https://industrial.api.ubidots.com/api/v1.6/devices/${DEVICE_LABEL}/${VARIABLE_LABEL}/values/?token=${TOKEN}`;

const TemperatureChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(URL);
                const result = await response.json();
                const values = result.results.map((entry) => entry.value);
                setData(values.slice(-20));
            } catch (error) {
                console.error("Error obteniendo datos de Ubidots", error);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">Temperatura en tiempo real desde Ubidots</h2>
            <Line
                data={{
                    labels: data.map((_, i) => i),
                    datasets: [
                        {
                            label: "Temperatura (°C)",
                            data: data,
                            borderColor: "#ff6384",
                            backgroundColor: "rgba(255,99,132,0.2)",
                        },
                    ],
                }}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                }}
            />
        </div>
    );
};

export default TemperatureChart;
