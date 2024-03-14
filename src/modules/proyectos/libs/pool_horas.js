// formatear minutos a horas tal que 'HH:MM'

export function formatearMinutos(minutos) {
    let horas = Math.floor(minutos / 60)
    let minutosRestantes = minutos % 60
    if ((horas < 0 ) && (minutosRestantes < 0)) {
        horas = horas.toString().replace('-','').padStart(3, '-0')
        minutosRestantes = minutosRestantes.toString().replace('-','').padStart(2, '0')
        const result = horas + ':' + minutosRestantes
        return result
    } else {
        const result = `${horas.toString().padStart(2, '0')}:${minutosRestantes.toString().padStart(2, '0')}`
        return result
    }
}