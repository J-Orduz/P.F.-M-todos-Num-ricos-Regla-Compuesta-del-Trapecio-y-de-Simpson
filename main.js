import { reglaTrapecio, evaluarFuncion, prepararFuncion  } from './Trapecio.js';
import { reglaSimpson } from './Simpson.js';

document.addEventListener('DOMContentLoaded', function() {
    const functionInput = document.getElementById('function');
    const resultDiv = document.getElementById('result');
    const trapecioBtn = document.getElementById('trapecio');
    const simpsonBtn = document.getElementById('simpson');
    const keyboardKeys = document.querySelectorAll('.key');
    const backspaceBtn = document.getElementById('backspace');

    // Manejar clics en el teclado virtual 
    keyboardKeys.forEach(key => {
        if (key.id !== 'backspace') { // Excluir el botón de borrado
            key.addEventListener('click', () => {
                const value = key.getAttribute('data-value');
                insertAtCursor(functionInput, value);
                functionInput.focus();
            });
        }
    });

    // Manejar backspace
    backspaceBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const input = functionInput;
        if (!input) return; // Validación adicional
        
        const start = input.selectionStart;
        const end = input.selectionEnd;
        
        if (start === end && start > 0) {
            input.value = input.value.substring(0, start - 1) + 
                        input.value.substring(end);
            input.selectionStart = input.selectionEnd = start - 1;
        } 
        else if (start !== end) {
            input.value = input.value.substring(0, start) + 
                        input.value.substring(end);
            input.selectionStart = input.selectionEnd = start;
        }
        
        input.dispatchEvent(new Event('input'));
        input.focus();
    });

    // Función para insertar texto en la posición del cursor
    function insertAtCursor(input, text) {
        if (!input || !text) return; // Validación de parámetros
        
        const start = input.selectionStart;
        const end = input.selectionEnd;
        
        input.value = input.value.substring(0, start) + 
                    text + 
                    input.value.substring(end);
        
        input.selectionStart = input.selectionEnd = start + text.length;
    }

    // Manejar el método del trapecio
    trapecioBtn.addEventListener('click', () => {
        calcularIntegral('trapecio');
    });

    // Manejar el método de Simpson
    simpsonBtn.addEventListener('click', () => {
        calcularIntegral('simpson');
    });

    // Función para calcular la integral numéricamente
    function calcularValorReal(funcionStr, a, b) {
        try {
            const funcionPreparada = prepararFuncion(funcionStr);
            
            // Usamos Simpson con un M muy grande para aproximar el valor "real"
            return reglaSimpson(funcionPreparada, a, b, 1000);
        } catch (error) {
            console.error("Error calculando valor real:", error);
            return null;
        }
    }


    // Función para calcular la integral
    function calcularIntegral(metodo) {
        const funcionStr = functionInput.value.trim();
        const a = parseFloat(document.getElementById('a').value);
        const b = parseFloat(document.getElementById('b').value);
        const M = parseInt(document.getElementById('m').value);

        if (!funcionStr) {
            alert('Por favor ingrese una función');
            return;
        }

        if (isNaN(a) || isNaN(b) || isNaN(M)) {
            alert('Por favor ingrese valores válidos para a, b y M');
            return;
        }

        if (M <= 0) {
            alert('El número de subintervalos M debe ser mayor que 0');
            return;
        }

        try {
            console.log('Función antes de preparada:', funcionStr);
            const funcionPreparada = prepararFuncion(funcionStr);
            console.log('Función preparada:', funcionPreparada);
            let resultado;

            if (metodo === 'trapecio') {
                resultado = reglaTrapecio(funcionPreparada, a, b, M);
                // Calcular valor de referencia de alta precisión
                const valorReferencia = calcularValorReal(funcionStr, a, b);
                
                // Calcular error real (diferencia con referencia)
                const errorReal = valorReferencia - resultado;
                
                // Mostrar error real
                document.getElementById('error-estimado').innerHTML = `Error real: ${formatErrorScientific(errorReal)}`;
            } else {
                resultado = reglaSimpson(funcionPreparada, a, b, M);
                // Calcular valor de referencia de alta precisión (usando Trapecio con M muy grande)
                const valorReferencia = calcularValorReal(funcionStr, a, b);
                
                // Calcular error real (diferencia con referencia)
                const errorReal = valorReferencia - resultado;
                
                // Mostrar error real
                document.getElementById('error-estimado').innerHTML = `Error real: ${formatErrorScientific(errorReal)}`;
            }

            // Mostrar resultado aproximado
            resultDiv.textContent = resultado.toFixed(10);
            
            // Calcular y mostrar valor "real" (aproximado con alta precisión)
            const valorReal = calcularValorReal(funcionStr, a, b);
            if (valorReal !== null) {
                document.getElementById('real-result').textContent = valorReal.toFixed(10);
                document.getElementById('upper-limit').textContent = b;
                document.getElementById('lower-limit').textContent = a;
                document.getElementById('integral-function').innerHTML = formatearFuncionParaVisualizacion(funcionStr);
            }

            // Solo mostrar gráfica si M es razonable
            const chartContainer = document.querySelector('.chart-container');
            if (M <= 100) {
                generarGrafica(funcionPreparada, a, b, M, metodo, funcionStr);
                if (chartContainer) chartContainer.style.display = 'block';
            } else {
                if (chartContainer) chartContainer.style.display = 'none';
                // Destruir gráfica existente
                if (window.integralChart) {
                    window.integralChart.destroy();
                    window.integralChart = null;
                }
            }
        } catch (error) {
            alert('Error al evaluar la función: ' + error.message);
            console.error(error);
        }
    }

    // Función para formatear la visualización de la función (sin afectar el cálculo)
    function formatearFuncionParaVisualizacion(funcionStr) {
        return funcionStr
            .replace(/sqrt\(([^)]+)\)/g, '√($1)')  // Reemplaza sqrt(...) por √(...)
            .replace(/\*\*/g, '^')              // Opcional: mostrar ^ en lugar de **
            .replace(/\*/g, '·');                  // * → ·
    }

    //Función para mostrar el error en notacion Cientifica
    function formatErrorScientific(number) {
        if (number === 0) return '0';
        
        const absNumber = Math.abs(number);
        const exponent = Math.floor(Math.log10(absNumber));
        const coefficient = (absNumber / Math.pow(10, exponent)).toFixed(4);
        
        // Manejar números entre 0.001 y 1000 que no necesitan notación científica
        if (exponent >= -3 && exponent <= 3) {
            return number.toFixed(7).replace(/\.?0+$/, '');
        }
        
        // Crear el superíndice para el exponente
        const superscriptExponent = exponent.toString()
            .replace(/-/g, '⁻')
            .replace(/0/g, '⁰')
            .replace(/1/g, '¹')
            .replace(/2/g, '²')
            .replace(/3/g, '³')
            .replace(/4/g, '⁴')
            .replace(/5/g, '⁵')
            .replace(/6/g, '⁶')
            .replace(/7/g, '⁷')
            .replace(/8/g, '⁸')
            .replace(/9/g, '⁹');
        
        return `${number < 0 ? '-' : ''}${coefficient}×10${superscriptExponent}`;
    }

    // Función para generar la gráfica
    function generarGrafica(funcionPreparada, a, b, M, metodo, funcionBasica) {
        const ctx = document.getElementById('integral-chart').getContext('2d');
        
        // Destruir gráfica anterior si existe
        if (window.integralChart) {
            window.integralChart.destroy();
        }
        
        // Generar puntos para la curva
        const puntos = [];
        const step = (b - a) / 200; // 200 puntos para una curva suave
        for (let x = a; x <= b; x += step) {
            puntos.push({x, y: evaluarFuncion(funcionPreparada, x)});
        }
        
        // Generar puntos para las divisiones
        const divisiones = [];
        const n = metodo === 'trapecio' ? M : 2 * M; // Simpson requiere 2M subintervalos
        const h = (b - a) / n;
        
        for (let i = 0; i <= n; i++) {
            const x = a + i * h;
            divisiones.push({
                x,
                y: evaluarFuncion(funcionPreparada, x)
            });
        }
        
        // Crear la gráfica
        window.integralChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'f(x)',
                        data: puntos,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: 'Divisiones',
                        data: divisiones,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 1)',
                        fill: false,
                        pointRadius: 4,
                        showLine: false,
                        pointStyle: 'rectRot'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'x'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'f(x)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'f(x) = '+funcionBasica
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `f(${context.parsed.x.toFixed(2)}) = ${context.parsed.y.toFixed(4)}`;
                            }
                        }
                    }
                }
            }
        });
    }

});