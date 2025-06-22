// Esta función evalúa la función ingresada como texto en el valor x
function evaluarFuncion(funcionStr, x) {
    return Function("x", `return ${funcionStr}`)(x);
}

// Prepara la función agregando 'Math.' automáticamente
function prepararFuncion(funcionStr) {
    return funcionStr
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/log/g, 'Math.log')
        .replace(/\bexp\b/g, 'Math.exp') 
        .replace(/pi/g, 'Math.PI')
        .replace(/\be\b/g, 'Math.E')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/(\([^)]+\))\^(-?\d+)/g, '($1**$2)')
        .replace(/(\w+)\^(-?\d+)/g, '($1**$2)');
}

// Implementación corregida de la Regla Compuesta de Simpson
// Implementación corregida de la Regla Compuesta de Simpson
export function reglaSimpson(funcionStr, a, b, M) {
    const N = 2 * M; // Número total de subintervalos
    const h = (b - a) / N;

    let sumaImpares = 0;
    let sumaPares = 0;

    for (let k = 1; k < N; k++) {
        let xk = a + k * h;
        if (k % 2 === 0) {
            sumaPares += evaluarFuncion(funcionStr, xk);
        } else {
            sumaImpares += evaluarFuncion(funcionStr, xk);
        }
    }

    const f_a = evaluarFuncion(funcionStr, a);
    const f_b = evaluarFuncion(funcionStr, b);

    const resultado = (h / 3) * (f_a + 4 * sumaImpares + 2 * sumaPares + f_b);

    return resultado;
}