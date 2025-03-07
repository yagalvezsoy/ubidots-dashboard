import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

const TOKEN = "BBUS-zfKP0Hwo3PLDc4Ajentj1KQ07FekY1";
const DEVICE_LABEL = "sensorTemp";
const VARIABLE_LABEL = "temperature";
const GET_URL = `https://industrial.api.ubidots.com/api/v1.6/devices/${DEVICE_LABEL}/${VARIABLE_LABEL}/values/?token=${TOKEN}&page_size=20`;
const POST_URL = `https://industrial.api.ubidots.com/api/v1.6/devices/${DEVICE_LABEL}/`;

const TemperatureChart = () => {
    const [data, setData] = useState([]);
    const [newTemperature, setNewTemperature] = useState("");
    const [rawData, setRawData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(GET_URL);
                const result = await response.json();
                console.log("Datos crudos recibidos desde Ubidots:", result);
                setRawData(result);

                if (result.results && Array.isArray(result.results)) {
                    const values = result.results.map((entry) => entry.value);
                    setData(values.slice(-20));
                } else {
                    console.warn("No hay datos recientes disponibles en Ubidots.", result.message || result);
                }
            } catch (error) {
                console.error("Error obteniendo datos de Ubidots", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const sendTemperatureToUbidots = async () => {
        if (!newTemperature) return alert("Ingresa un valor de temperatura");

        try {
            const response = await fetch(POST_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-Token": TOKEN,
                },
                body: JSON.stringify({
                    [VARIABLE_LABEL]: parseFloat(newTemperature),
                }),
            });

            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("Datos enviados con éxito:", result);
            setNewTemperature("");
        } catch (error) {
            console.error("Error enviando datos a Ubidots:", error);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">Temperatura en tiempo real desde Ubidots</h2>

            {rawData && (
                <pre className="bg-gray-100 p-2 text-sm overflow-auto max-h-40">
                    {JSON.stringify(rawData, null, 2)}
                </pre>
            )}

            {data.length > 0 ? (
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
            ) : (
                <p className="text-red-500">Yonathan Andres Galvez Giraldo: 402 (Payment Required). No hay datos disponibles</p>
            )}

            <div className="mt-4">
                <input
                    type="number"
                    placeholder="Ingresa temperatura"
                    value={newTemperature}
                    onChange={(e) => setNewTemperature(e.target.value)}
                    className="border p-2 rounded"
                />
                <button
                    onClick={sendTemperatureToUbidots}
                    className="bg-blue-500 text-white p-2 ml-2 rounded"
                >
                    Enviar Temperatura
                </button>
            </div>
        </div>
    );
};

export default TemperatureChart;