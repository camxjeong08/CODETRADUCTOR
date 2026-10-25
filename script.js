// Ejemplos predefinidos para la herramienta educativa
const ejemplos = {
    ex1: `const nombre = "Cami";\nlet edad = 18;\n\nif (edad >= 18) {\n    alert("Hola " + nombre + ", eres mayor de edad");\n}`,
    ex2: `let frutas = ["Manzana", "Pera", "Uva"];\n\nfor (let i = 0; i < frutas.length; i++) {\n    console.log(frutas[i]);\n}`,
    ex3: `function sumar(a, b) {\n    return a + b;\n}\n\nlet resultado = sumar(5, 3);`
};

document.addEventListener("DOMContentLoaded", () => {
    const codeInput = document.getElementById("codeInput");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const clearBtn = document.getElementById("clearBtn");
    const exampleSelect = document.getElementById("exampleSelect");
    const errorMsg = document.getElementById("errorMsg");
    const resultsSection = document.getElementById("resultsSection");
    
    const summaryText = document.getElementById("summaryText");
    const conceptsList = document.getElementById("conceptsList");
    const lineExplanationList = document.getElementById("lineExplanationList");

    // Cargar ejemplo seleccionado
    exampleSelect.addEventListener("change", (e) => {
        const selectedKey = e.target.value;
        if (ejemplos[selectedKey]) {
            codeInput.value = ejemplos[selectedKey];
            hideError();
        }
    });

    // Botón limpiar
    clearBtn.addEventListener("click", () => {
        codeInput.value = "";
        exampleSelect.value = "";
        resultsSection.classList.add("hidden");
        hideError();
    });

    // Botón analizar
    analyzeBtn.addEventListener("click", () => {
        const code = codeInput.value.trim();

        if (!code) {
            showError("Por favor, escribe o pega un fragmento de código JavaScript para analizar.");
            resultsSection.classList.add("hidden");
            return;
        }

        hideError();
        procesarCodigo(code);
        resultsSection.classList.remove("hidden");
    });

    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.classList.remove("hidden");
    }

    function hideError() {
        errorMsg.textContent = "";
        errorMsg.classList.add("hidden");
    }

    // Motor de análisis basado en reglas línea por línea
    function procesarCodigo(code) {
        const lineas = code.split("\n");
        let explicacionesHTML = "";
        let conceptosDetectados = new Set();
        let contadorLineasReconocidas = 0;

        lineas.forEach((linea, index) => {
            const numeroLinea = index + 1;
            const lineaTrim = linea.trim();

            // Líneas vacías o llaves sueltas
            if (lineaTrim === "" || lineaTrim === "}" || lineaTrim === "});" || lineaTrim === "{") {
                if (lineaTrim !== "") {
                    explicacionesHTML += `
                        <div class="line-item">
                            <div class="line-code">Línea ${numeroLinea}: ${escapeHtml(lineaTrim)}</div>
                            <div class="line-explanation">Estructura sintáctica de cierre o apertura de bloque.</div>
                        </div>`;
                }
                return;
            }

            contadorLineasReconocidas++;
            let explicacion = "";

            // 1. Declaración de variables (const, let, var)
            if (/^(const|let|var)\s+\w+/.test(lineaTrim)) {
                const tipo = lineaTrim.split(" ")[0];
                const nombreVar = lineaTrim.split(/\s+/)[1];
                conceptosDetectados.add("Variables (" + tipo + ")");
                explicacion = `Se crea una ${tipo === 'const' ? 'constante' : 'variable'} llamada <strong>${nombreVar}</strong>. ` +
                              (tipo === 'const' ? 'Su valor no podrá ser reasignado posteriormente.' : 'Su valor puede cambiar a lo largo del programa.');
            }
            // 2. Condicionales if / else if / else
            else if (/^if\s*\(/.test(lineaTrim)) {
                conceptosDetectados.add("Condicionales (if)");
                explicacion = `Se evalúa una condición lógica dentro de los paréntesis. Si se cumple, se ejecutarán las instrucciones contenidas en el bloque de código siguiente.`;
            }
            else if (/^else\s*if\s*\(/.test(lineaTrim)) {
                conceptosDetectados.add("Condicionales (else if)");
                explicacion = `Se evalúa una condición alternativa en caso de que la condición anterior no se haya cumplido.`;
            }
            else if (/^else\s*\{?/.test(lineaTrim)) {
                conceptosDetectados.add("Condicionales (else)");
                explicacion = `Define un bloque de código que se ejecutará por defecto si ninguna de las condiciones anteriores se cumplió.`;
            }
            // 3. Ciclos (for, while)
            else if (/^for\s*\(/.test(lineaTrim)) {
                conceptosDetectados.add("Ciclos (for)");
                explicacion = `Se inicia un ciclo repetitivo (bucle for) que se ejecutará de forma controlada según la condición establecida en su estructura.`;
            }
            else if (/^while\s*\(/.test(lineaTrim)) {
                conceptosDetectados.add("Ciclos (while)");
                explicacion = `Se inicia un ciclo repetitivo que mantendrá su ejecución mientras la condición especificada permanezca verdadera.`;
            }
            // 4. Funciones
            else if (/^function\s+\w+/.test(lineaTrim)) {
                conceptosDetectados.add("Funciones");
                const nombreFunc = lineaTrim.match(/function\s+(\w+)/)[1];
                explicacion = `Se declara una función reutilizable llamada <strong>${nombreFunc}</strong>, la cual agrupa un conjunto de instrucciones para realizar una tarea específica.`;
            }
            // 5. Instrucciones alert / console.log / return
            else if (/^alert\s*\(/.test(lineaTrim)) {
                conceptosDetectados.add("Instrucciones / Salidas");
                explicacion = `Muestra una ventana emergente de alerta en el navegador con el mensaje o valor indicado.`;
            }
            else if (/^console\.log\s*\(/.test(lineaTrim)) {
                conceptosDetectados.add("Instrucciones / Consola");
                explicacion = `Envía un mensaje o el resultado de una operación directamente a la consola de depuración del navegador.`;
            }
            else if (/^return\s+/.test(lineaTrim)) {
                conceptosDetectados.add("Retorno de Funciones");
                explicacion = `Finaliza la ejecución de la función actual y devuelve un valor específico como resultado hacia el lugar donde fue llamada.`;
            }
            // 6. Asignaciones sencillas
            else if (/^\w+\s*=/.test(lineaTrim)) {
                conceptosDetectados.add("Asignaciones");
                const nombreVar = lineaTrim.split("=")[0].trim();
                explicacion = `Se actualiza o asigna un nuevo valor a la variable existente <strong>${nombreVar}</strong>.`;
            }
            // Instrucción no reconocida con certeza
            else {
                conceptosDetectados.add("Instrucción general");
                explicacion = `Línea de código general o instrucción compleja. <em>Nota: Esta instrucción requiere revisión manual ya que escapa a las reglas básicas del traductor actual.</em>`;
            }

            explicacionesHTML += `
                <div class="line-item">
                    <div class="line-code">Línea ${numeroLinea}: ${escapeHtml(lineaTrim)}</div>
                    <div class="line-explanation">${explicacion}</div>
                </div>`;
        });

        // Generar resumen general
        let resumen = `El código introducido consta de ${lineas.length} líneas analizadas. `;
        if (conceptosDetectados.size > 0) {
            resumen += `Utiliza estructuras orientadas a: ${Array.from(conceptosDetectados).join(", ").toLowerCase()}. Este programa procesa los datos secuencialmente aplicando lógica de programación básica en JavaScript.`;
        } else {
            resumen += `No se detectaron estructuras estándar reconocibles de manera confiable.`;
        }
        summaryText.textContent = resumen;

        // Generar etiquetas de conceptos
        let conceptsHTML = "";
        if (conceptosDetectados.size > 0) {
            conceptosDetectados.forEach(concepto => {
                conceptsHTML += `<span class="tag">${concepto}</span>`;
            });
        } else {
            conceptsHTML = `<span class="tag">Sin conceptos identificados</span>`;
        }
        conceptsList.innerHTML = conceptsHTML;

        // Renderizar explicaciones de líneas
        lineExplanationList.innerHTML = explicacionesHTML;
    }

    // Utilidad para evitar problemas con caracteres especiales HTML
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});