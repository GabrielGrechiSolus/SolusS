import Layout from '../components/template/Layout';
import React, { useState } from 'react';
import xml2js from 'xml2js';

function calculateValues(xmlContent) {
    const parser = new xml2js.Parser({ explicitArray: true });
    let calculos = {
        totalValorInformado: 0,
        totalValorPagoProc: 0,
        valorPagoGuia: 0,
        procedimentosDetalhes: [],
    };

    parser.parseString(xmlContent, (err, result) => {
        if (err) throw new Error('Erro ao processar o XML');

        const guiaMonitoramento = result['ans:guiaMonitoramento'];
        const procedimentos = guiaMonitoramento['ans:procedimentos'];
        const valoresGuia = guiaMonitoramento['ans:valoresGuia']?.[0] || {};

        calculos.valorPagoGuia = parseFloat(valoresGuia['ans:valorPagoGuia']?.[0]) || 0;

        calculos.procedimentosDetalhes = procedimentos.map((proc) => {
            const identProcedimento = proc['ans:identProcedimento']?.[0] || {};
            const codigoTabela = identProcedimento['ans:codigoTabela']?.[0] || 'N/A';
            const grupoProcedimento = identProcedimento['ans:Procedimento']?.[0]?.['ans:grupoProcedimento']?.[0] || 'N/A';

            const valorInformado = parseFloat(proc['ans:valorInformado']?.[0]) || 0;
            const valorPagoProc = parseFloat(proc['ans:valorPagoProc']?.[0]) || 0;

            calculos.totalValorInformado += valorInformado;
            calculos.totalValorPagoProc += valorPagoProc;

            return {
                codigoTabela,
                grupoProcedimento,
                valorInformado,
                valorPagoProc,
            };
        });

        calculos.totalValorInformado = parseFloat(calculos.totalValorInformado.toFixed(2));
        calculos.totalValorPagoProc = parseFloat(calculos.totalValorPagoProc.toFixed(2));
    });

    calculos.areEqual = calculos.totalValorPagoProc === calculos.valorPagoGuia;

    return calculos;
}

export default function LerXML() {
    const [file, setFile] = useState(null);
    const [results, setResults] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files?.[0] || null);
    };

    const handleProcessFile = () => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const xmlContent = event.target?.result;
            const calculatedResults = calculateValues(xmlContent);
            setResults(calculatedResults);
        };
        reader.readAsText(file);
    };

    const closeModal = () => setResults(null);

    return (
        <Layout titulo="Processar XML" subtitulo="Carregue e visualize os resultados do arquivo">
            <div className="flex flex-col items-center w-full h-full">
                <div className="w-full max-w-md">
                    <input 
                        type="file" 
                        accept=".xml" 
                        onChange={handleFileChange} 
                        className="block w-full border rounded-md p-2"
                    />
                    <button 
                        onClick={handleProcessFile} 
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md mt-4"
                    >
                        Processar Arquivo
                    </button>
                </div>

                {results && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full">
                            <div className="p-4 border-b flex justify-between">
                                <h2 className="text-lg font-semibold">Resultados</h2>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={closeModal}
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-4 max-h-96 overflow-y-auto">
                                <ul className="space-y-2">
                                    <li>
                                        <strong>Total Valor Informado:</strong> {results.totalValorInformado.toFixed(2)}
                                    </li>
                                    <li>
                                        <strong>Total Valor Pago Proc:</strong> {results.totalValorPagoProc.toFixed(2)}
                                    </li>
                                    <li>
                                        <strong>Valor Pago Guia:</strong> {results.valorPagoGuia.toFixed(2)}
                                    </li>
                                    <li>
                                        <strong>Os valores são:</strong> {results.areEqual ? 'Iguais' : 'Diferentes'}
                                    </li>
                                </ul>

                                <h3 className="mt-4 text-md font-medium">Detalhes dos Procedimentos</h3>
                                <table className="w-full border-collapse border text-sm mt-2">
                                    <thead>
                                        <tr className="bg-gray-300">
                                            <th className="border px-3 py-2 text-left">Código Tabela</th>
                                            <th className="border px-3 py-2 text-left">Grupo Procedimento</th>
                                            <th className="border px-3 py-2 text-left">Valor Informado</th>
                                            <th className="border px-3 py-2 text-left">Valor Pago</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.procedimentosDetalhes.map((proc, index) => (
                                            <tr key={index} className="even:bg-gray-100">
                                                <td className="border px-3 py-1">{proc.codigoTabela}</td>
                                                <td className="border px-3 py-1">{proc.grupoProcedimento}</td>
                                                <td className="border px-3 py-1">{proc.valorInformado.toFixed(2)}</td>
                                                <td className="border px-3 py-1">{proc.valorPagoProc.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t text-right">
                                <button 
                                    onClick={closeModal} 
                                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
