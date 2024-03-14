export function sumTareaTiempoTotal(tareas) {
    let tiempo_total = 0
    for (let i = 0; i < tareas.length; i++) {
        tiempo_total = tiempo_total + tareas[i].tiempo_total
    }
    return tiempo_total
}