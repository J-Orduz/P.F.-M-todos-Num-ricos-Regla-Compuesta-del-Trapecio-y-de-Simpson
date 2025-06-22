// Esta función evalúa la función ingresada como texto en el valor x
export function evaluarFuncion(funcionStr, x) {
    return Function("x", `return ${funcionStr}`)(x);
}

// Prepara la función agregando 'Math.' automáticamente
export function prepararFuncion(funcionStr) {
    // Manejar exponentes primero
    let nuevaFunc = funcionStr
        .replace(/(\w*\([^)]+\)|\w+|\b\d+\b)\s*\^\s*(-?\d+\.?\d*)/g, '($1)**$2')
        .replace(/(\))\s*\^\s*(-?\d+\.?\d*)/g, '$1**$2')
        //.replace(/(\([^)]+\))\^(-?\d+)/g, '($1**$2)')
        .replace(/(\w+)\^(-?\d+)/g, '($1**$2)');;

    // Luego manejar funciones y constantes
    return nuevaFunc
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/log/g, 'Math.log')
        .replace(/\bexp\b/g, 'Math.exp') 
        .replace(/pi/g, 'Math.PI')
        .replace(/\be\b/g, 'Math.E')
        .replace(/sqrt/g, 'Math.sqrt');
}

// Implementación de la Regla Compuesta del Trapecio
export function reglaTrapecio(funcionStr, a, b, M) {
    console.log(funcionStr);
    const h = (b - a) / M;
    let suma = 0;

    for (let k = 1; k < M; k++) {
        let xk = a + k * h;
        suma += evaluarFuncion(funcionStr, xk);
    }

    const f_a = evaluarFuncion(funcionStr, a);
    const f_b = evaluarFuncion(funcionStr, b);

    const resultado = (h / 2) * (f_a + 2 * suma + f_b);

    return resultado;
}