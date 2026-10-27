document.addEventListener('DOMContentLoaded', () => {
    const startElement = document.getElementById('relationship-start');
    const monthsElement = document.getElementById('elapsed-months');
    const daysElement = document.getElementById('elapsed-days');
    const hoursElement = document.getElementById('elapsed-hours');
    const minutesElement = document.getElementById('elapsed-minutes');
    const secondsElement = document.getElementById('elapsed-seconds');
    const totalDaysElement = document.getElementById('elapsed-total-days');

    if (!startElement || !monthsElement || !daysElement || !hoursElement || !minutesElement || !secondsElement) return;

    const [year, month, day] = (startElement.dataset.startDate || '').split('-').map(Number);
    if (!year || !month || !day) return;

    // Cria a data no horário local para evitar diferenças de fuso de UTC.
    const startDate = new Date(year, month - 1, day, 0, 0, 0);
    const pad = (value) => String(value).padStart(2, '0');

    function addCalendarMonths(date, amount) {
        const result = new Date(date);
        const originalDay = result.getDate();
        result.setDate(1);
        result.setMonth(result.getMonth() + amount);
        const lastDayOfMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
        result.setDate(Math.min(originalDay, lastDayOfMonth));
        return result;
    }

    function updateCounter() {
        const now = new Date();
        const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / 1000));
        const totalDays = Math.floor(elapsedSeconds / 86400);
        let months = (now.getFullYear() - startDate.getFullYear()) * 12
            + now.getMonth() - startDate.getMonth();
        if (addCalendarMonths(startDate, months) > now) months -= 1;

        const lastMonthAnniversary = addCalendarMonths(startDate, Math.max(0, months));
        const remainderSeconds = Math.max(0, Math.floor((now.getTime() - lastMonthAnniversary.getTime()) / 1000));
        const days = Math.floor(remainderSeconds / 86400);
        const hours = Math.floor((remainderSeconds % 86400) / 3600);
        const minutes = Math.floor((remainderSeconds % 3600) / 60);
        const seconds = remainderSeconds % 60;

        monthsElement.textContent = String(months);
        daysElement.textContent = String(days);
        hoursElement.textContent = pad(hours);
        minutesElement.textContent = pad(minutes);
        secondsElement.textContent = pad(seconds);
        if (totalDaysElement) totalDaysElement.textContent = String(totalDays);
    }

    updateCounter();
    window.setInterval(updateCounter, 1000);
});
