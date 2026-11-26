// NestEgg — hand-drawn canvas charts. No chart library, no network: two
// small painters, one donut for "where the money went" and one grouped
// bar chart for the six-month income-vs-spending report. Both scale by
// devicePixelRatio so they stay crisp on retina screens.

function setupCanvas(canvas, cssWidth, cssHeight) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  canvas.style.width = cssWidth + "px";
  canvas.style.height = cssHeight + "px";
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function drawDonut(canvas, slices, centerTop, centerBottom) {
  const size = 260;
  const ctx = setupCanvas(canvas, size, size);
  const cx = size / 2;
  const cy = size / 2;
  const outer = 112;
  const inner = 72;
  const total = slices.reduce((s, p) => s + p.value, 0);
  let angle = -Math.PI / 2;
  for (const slice of slices) {
    const sweep = total > 0 ? (slice.value / total) * Math.PI * 2 : 0;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    angle += sweep;
  }
  // Punch the hole and write the centre label.
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#202820";
  ctx.font = "700 22px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(centerTop, cx, cy - 12);
  ctx.fillStyle = "#6E6252";
  ctx.font = "13px system-ui, sans-serif";
  ctx.fillText(centerBottom, cx, cy + 14);
}

function drawBars(canvas, months) {
  const width = 640;
  const height = 300;
  const ctx = setupCanvas(canvas, width, height);
  const padLeft = 52;
  const padRight = 12;
  const padTop = 18;
  const padBottom = 34;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const maxVal = Math.max.apply(
    null,
    months.map((m) => Math.max(m.income, m.spent))
  );
  const top = Math.ceil(maxVal / 2000) * 2000;

  // Gridlines and y labels.
  ctx.strokeStyle = "#E7E0D4";
  ctx.fillStyle = "#6E6252";
  ctx.font = "12px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let v = 0; v <= top; v += 2000) {
    const y = padTop + plotH - (v / top) * plotH;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();
    ctx.fillText("$" + (v / 1000) + "k", padLeft - 8, y);
  }

  // One group per month: income bar (green) beside spending bar (gold).
  const groupW = plotW / months.length;
  const barW = Math.min(34, (groupW - 26) / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  months.forEach((m, i) => {
    const gx = padLeft + i * groupW;
    const incomeH = (m.income / top) * plotH;
    const spentH = (m.spent / top) * plotH;
    ctx.fillStyle = "#176B52";
    ctx.fillRect(gx + (groupW - barW * 2 - 6) / 2, padTop + plotH - incomeH, barW, incomeH);
    ctx.fillStyle = "#E8A33D";
    ctx.fillRect(gx + (groupW - barW * 2 - 6) / 2 + barW + 6, padTop + plotH - spentH, barW, spentH);
    ctx.fillStyle = "#202820";
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillText(m.month, gx + groupW / 2, padTop + plotH + 10);
  });

  // Legend.
  ctx.textAlign = "left";
  ctx.font = "13px system-ui, sans-serif";
  ctx.fillStyle = "#176B52";
  ctx.fillRect(padLeft, 0, 12, 12);
  ctx.fillStyle = "#202820";
  ctx.fillText("Income", padLeft + 18, 0);
  ctx.fillStyle = "#E8A33D";
  ctx.fillRect(padLeft + 92, 0, 12, 12);
  ctx.fillStyle = "#202820";
  ctx.fillText("Spending", padLeft + 110, 0);
}
