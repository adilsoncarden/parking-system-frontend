function formatDuration(minutes) {
  if (minutes < 0) return '--';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function generateMockData() {
  const data = [];
  const tipos = ['Residente', 'Invitado', 'Entrega', 'Servicio'];
  // Set base date to late April 2026
  const baseDate = new Date('2026-04-28');
  
  for (let i = 1; i <= 50; i++) {
    // Distribute data: first 10 for today, others spread over last 60 days
    const isToday = i <= 10;
    const daysAgo = isToday ? 0 : Math.floor(Math.random() * 60);
    
    const d = new Date(baseDate);
    d.setDate(d.getDate() - daysAgo);
    
    // Format date consistently (e.g. Apr 17, 2026)
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const fecha = d.toLocaleDateString('en-US', options);
    
    const entryHour = 6 + Math.floor(Math.random() * 16); // 6 AM to 10 PM
    const entryMinute = Math.floor(Math.random() * 60);
    const hasExited = Math.random() > 0.2; // 80% chance of having exited
    
    let durationMinutes = 0;
    let horaSalida = 'Aún dentro';
    
    const entryAmPm = entryHour >= 12 ? 'PM' : 'AM';
    const entryDisplayHour = entryHour > 12 ? entryHour - 12 : (entryHour === 0 ? 12 : entryHour);
    const horaEntrada = `${entryDisplayHour.toString().padStart(2, '0')}:${entryMinute.toString().padStart(2, '0')} ${entryAmPm}`;

    if (hasExited) {
      durationMinutes = 15 + Math.floor(Math.random() * 600); // 15 mins to 10 hours
      const totalExitMinutes = entryHour * 60 + entryMinute + durationMinutes;
      const exitHour24 = Math.floor(totalExitMinutes / 60) % 24;
      const exitMinute = totalExitMinutes % 60;
      const ampm = exitHour24 >= 12 ? 'PM' : 'AM';
      const displayHour = exitHour24 % 12 === 0 ? 12 : exitHour24 % 12;
      horaSalida = `${displayHour.toString().padStart(2, '0')}:${exitMinute.toString().padStart(2, '0')} ${ampm}`;
    }
    
    const tipoOcupante = tipos[Math.floor(Math.random() * tipos.length)];
    
    data.push({
      id: i,
      fecha,
      horaEntrada,
      horaSalida,
      placa: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${1000 + i}`,
      unidad: `Unit ${101 + Math.floor(Math.random() * 20)}`,
      tipoOcupante,
      duracion: hasExited ? formatDuration(durationMinutes) : '--'
    });
  }
  return data;
}

export const mockData = generateMockData();
