function buildTable({
    m=100
}={}) {
    let arr = [...Array(m).keys()]
    let fmt = (n) => n.toFixed(2)
    let t = `
        <table width=100% border=1 cellspacing=1 cellpadding=1>
        <thead><tr><td colspan=2>Table Header</td></tr></thead>
        <tfoot><tr><td colspan=2><small><small>Table Footer</small></small></td></tr></tfoot>
        ${
            arr
            .map((i) => '<tr><td width=50 align=right>' + (i+1) + '</td><td align=right>' + fmt(Math.random() * 100) + '</td><tr>')
            .join('')
        }
        </table>
        `

    var e = document.getElementById('table')
    e.innerHTML = t

}