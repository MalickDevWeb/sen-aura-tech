import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toPng } from "html-to-image";
import { detectDocumentContext, DocumentContextType } from "./invoiceContext";

const tempCanvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
const tempCtx = tempCanvas ? tempCanvas.getContext("2d") : null;

function parseComponent(val: string, maxVal: number): number {
  if (!val || val === "none") return 0;
  if (val.endsWith("%")) {
    return (parseFloat(val) / 100) * (maxVal === 360 ? 360 : 1);
  }
  if (val.endsWith("deg")) {
    return parseFloat(val);
  }
  return parseFloat(val);
}

function gammaCorrect(c: number): number {
  const absC = c < 0 ? 0 : c;
  const corrected = absC <= 0.0031308 ? 12.92 * absC : 1.055 * Math.pow(absC, 1 / 2.4) - 0.055;
  return Math.min(255, Math.max(0, Math.round(corrected * 255)));
}

/**
 * Converts an oklch(...) string into a standard rgb(...) or rgba(...) string
 */
export function oklchToRgbString(oklchMatch: string): string {
  try {
    // 1. Try browser canvas 2d parsing if supported natively
    if (tempCtx) {
      try {
        tempCtx.fillStyle = "#123456";
        tempCtx.fillStyle = oklchMatch;
        if (tempCtx.fillStyle && tempCtx.fillStyle !== "#123456") {
          return tempCtx.fillStyle;
        }
      } catch {
        // Fallback to JS math
      }
    }

    // 2. Pure JS Math Fallback for OKLCH
    const match = oklchMatch.match(/oklch\(\s*([\s\S]+?)\s*\)/i);
    if (!match) return "#000000";
    const inner = match[1].trim();

    const [colorPart, alphaPart] = inner.split("/");
    const parts = colorPart.trim().split(/\s+/);
    if (parts.length < 3) return "#000000";

    let l = parseComponent(parts[0], 1);
    let c = parseComponent(parts[1], 1);
    let h = parseComponent(parts[2], 360);

    if (isNaN(l)) l = 0;
    if (isNaN(c)) c = 0;
    if (isNaN(h)) h = 0;

    let a = 1;
    if (alphaPart) {
      a = parseComponent(alphaPart.trim(), 1);
      if (isNaN(a)) a = 1;
    }

    const hRad = (h * Math.PI) / 180;
    const aComp = c * Math.cos(hRad);
    const bComp = c * Math.sin(hRad);

    const l_ = l + 0.3963377774 * aComp + 0.2158037573 * bComp;
    const m_ = l - 0.1055613458 * aComp - 0.0638541728 * bComp;
    const s_ = l - 0.0894841775 * aComp - 1.2914855480 * bComp;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    const rLinear = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const gLinear = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const bLinear = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

    const r = gammaCorrect(rLinear);
    const g = gammaCorrect(gLinear);
    const b = gammaCorrect(bLinear);

    if (a < 1) {
      return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(3))})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return "#000000";
  }
}

/**
 * Converts any CSS oklch() or oklab() color strings into standard hex/rgb color strings
 */
export function convertOklchToRgb(colorStr: string): string {
  if (!colorStr || typeof colorStr !== "string" || (!colorStr.includes("oklch") && !colorStr.includes("oklab"))) {
    return colorStr || "";
  }

  return colorStr
    .replace(/oklch\([\s\S]*?\)/gi, (m) => oklchToRgbString(m))
    .replace(/oklab\([\s\S]*?\)/gi, "#000000");
}

/**
 * Temporarily replaces all oklch() color functions inside all <style> tags in document.head
 * so that html2canvas can safely read document.styleSheets without crashing on unsupported CSS color functions.
 */
function sanitizeMainDocumentStylesForHtml2Canvas(): () => void {
  const styles = Array.from(document.querySelectorAll("style"));
  const originalContents: { el: HTMLStyleElement; content: string }[] = [];

  styles.forEach((style) => {
    if (style.textContent && (style.textContent.includes("oklch") || style.textContent.includes("oklab"))) {
      originalContents.push({ el: style, content: style.textContent });
      style.textContent = convertOklchToRgb(style.textContent);
    }
  });

  return () => {
    originalContents.forEach(({ el, content }) => {
      try {
        el.textContent = content;
      } catch {
        // Ignore if element removed
      }
    });
  };
}

/**
 * Cleans all cloned DOM elements, style tags, and inline styles before html2canvas renders
 * to guarantee that no unsupported oklch() CSS color functions reach html2canvas.
 */
export function sanitizeClonedDocForCanvas(clonedDoc: Document) {
  try {
    // 1. Sanitize all <style> blocks
    const styleEls = clonedDoc.querySelectorAll("style");
    styleEls.forEach((s) => {
      if (s.textContent && (s.textContent.includes("oklch") || s.textContent.includes("oklab"))) {
        s.textContent = convertOklchToRgb(s.textContent);
      }
    });

    // 2. Traverse all elements and explicitly set inline RGB/HEX properties
    const allElements = clonedDoc.querySelectorAll<HTMLElement>("*");
    allElements.forEach((el) => {
      try {
        const comp = clonedDoc.defaultView?.getComputedStyle(el) || window.getComputedStyle(el);
        if (comp) {
          const propsToFix = [
            "color",
            "backgroundColor",
            "borderColor",
            "borderTopColor",
            "borderRightColor",
            "borderBottomColor",
            "borderLeftColor",
            "outlineColor",
            "fill",
            "stroke",
            "boxShadow",
            "backgroundImage",
          ] as const;

          propsToFix.forEach((prop) => {
            const val = comp.getPropertyValue(prop) || (comp as any)[prop];
            if (val && (val.includes("oklch") || val.includes("oklab"))) {
              const cleaned = convertOklchToRgb(val);
              el.style.setProperty(prop, cleaned, "important");
            }
          });
        }

        const rawStyle = el.getAttribute("style");
        if (rawStyle && (rawStyle.includes("oklch") || rawStyle.includes("oklab"))) {
          el.setAttribute("style", convertOklchToRgb(rawStyle));
        }
      } catch {
        // Continue on individual element errors
      }
    });
  } catch (err) {
    console.warn("Color sanitization warning:", err);
  }
}

/**
 * Renders an HTML element to a File object (image/png) for Web Share API or download.
 */
export async function getElementAsPngFile(
  element: HTMLElement,
  fileName: string,
  options?: { backgroundColor?: string; pixelRatio?: number }
): Promise<File | null> {
  const bg = options?.backgroundColor || "#0b0f19";
  const ratio = options?.pixelRatio || 3.0;

  try {
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: ratio,
      backgroundColor: bg,
      imagePlaceholder: "data:image/png;base64,iVBORw0KGgoAAAANSU5ErkJggg==",
      skipFonts: false,
    });

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName.endsWith(".png") ? fileName : `${fileName}.png`, { type: "image/png" });
  } catch (err) {
    console.warn("Primary toPng failed for getElementAsPngFile, trying html2canvas fallback:", err);
    try {
      const restoreStyles = sanitizeMainDocumentStylesForHtml2Canvas();
      const canvas = await html2canvas(element, {
        scale: ratio,
        useCORS: true,
        allowTaint: true,
        backgroundColor: bg,
        logging: false,
        onclone: (clonedDoc) => {
          sanitizeClonedDocForCanvas(clonedDoc);
        },
      });
      if (restoreStyles) restoreStyles();

      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return new File([blob], fileName.endsWith(".png") ? fileName : `${fileName}.png`, { type: "image/png" });
    } catch (fallbackErr) {
      console.error("Failed to get element as PNG file:", fallbackErr);
      return null;
    }
  }
}

/**
 * Renders an HTML element to a high-resolution PNG image file and triggers a browser download.
 */
export async function downloadElementAsPNG(
  element: HTMLElement,
  fileName: string,
  options?: { backgroundColor?: string; pixelRatio?: number }
): Promise<boolean> {
  const bg = options?.backgroundColor || "#0b0f19";
  const ratio = options?.pixelRatio || 3.0;

  try {
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: ratio,
      backgroundColor: bg,
      imagePlaceholder: "data:image/png;base64,iVBORw0KGgoAAAANSU5ErkJggg==",
      skipFonts: false,
    });

    const link = document.createElement("a");
    link.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (err) {
    console.warn("Primary toPng failed for PNG download, trying html2canvas fallback:", err);
    try {
      const restoreStyles = sanitizeMainDocumentStylesForHtml2Canvas();
      const canvas = await html2canvas(element, {
        scale: ratio,
        useCORS: true,
        allowTaint: true,
        backgroundColor: bg,
        logging: false,
        onclone: (clonedDoc) => {
          sanitizeClonedDocForCanvas(clonedDoc);
        },
      });
      if (restoreStyles) restoreStyles();

      const imgData = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
      link.href = imgData;
      link.click();
      return true;
    } catch (fallbackErr) {
      console.error("Failed to download element as PNG:", fallbackErr);
      console.error("Erreur lors de la génération de l'image PNG.");
      return false;
    }
  }
}

/**
 * Robustly renders an HTML element to a PDF document using html2canvas with full color sanitization
 * and direct jsPDF fallback if html2canvas encounters rendering limitations.
 */
export async function downloadElementAsPDF(
  element: HTMLElement,
  fileName: string,
  options?: {
    orientation?: "landscape" | "portrait";
    format?: "a4" | "letter";
    fallbackData?: {
      title: string;
      studentName?: string;
      id?: string;
      details?: string[];
    };
  }
): Promise<boolean> {
  const orientation = options?.orientation || "landscape";
  const format = options?.format || "a4";
  const pdfWidth = orientation === "landscape" ? 297 : 210;
  const pdfHeight = orientation === "landscape" ? 210 : 297;

  // 1. Primary Strategy: html-to-image (Native SVG foreignObject rendering - 100% Tailwind v4 & oklch compatible)
  try {
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2.0,
      backgroundColor: "#ffffff",
      imagePlaceholder: "data:image/png;base64,iVBORw0KGgoAAAANSU5ErkJggg==",
      skipFonts: false,
    });

    const imgWidth = pdfWidth;
    const elemWidth = element.offsetWidth || 800;
    const elemHeight = element.offsetHeight || 600;
    const imgHeight = (elemHeight * pdfWidth) / elemWidth;

    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format,
    });

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
    return true;
  } catch {
    // 2. Secondary Strategy: html2canvas with full color sanitization
    let restoreStyles: (() => void) | null = null;
    try {
      restoreStyles = sanitizeMainDocumentStylesForHtml2Canvas();

      const canvas = await html2canvas(element, {
        scale: 2.0,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          sanitizeClonedDocForCanvas(clonedDoc);
        },
      });

      if (restoreStyles) restoreStyles();

      const imgData = canvas.toDataURL("image/png", 1.0);
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format,
      });

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
      return true;
    } catch {
      if (restoreStyles) restoreStyles();

      // 3. Fallback Strategy: Direct jsPDF Vector Document
      try {
        const pdf = new jsPDF({
          orientation,
          unit: "mm",
          format,
        });

        const width = orientation === "landscape" ? 297 : 210;

        // Header Banner
        pdf.setFillColor(15, 23, 42); // slate-900
        pdf.rect(0, 0, width, 35, "F");

        pdf.setTextColor(245, 158, 11); // amber-500
        pdf.setFontSize(20);
        pdf.setFont("helvetica", "bold");
        pdf.text("SEN AURA TECH SÉNÉGAL", 15, 18);

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text("DOCUMENT OFFICIEL HOMOLOGUÉ", 15, 26);

        if (options?.fallbackData?.id) {
          pdf.text(`Réf: ${options.fallbackData.id}`, width - 60, 26);
        }

        // Title
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(22);
        pdf.setFont("helvetica", "bold");
        pdf.text(options?.fallbackData?.title || "Document Officiel", 15, 55);

        if (options?.fallbackData?.studentName) {
          pdf.setFontSize(16);
          pdf.setTextColor(180, 83, 9); // amber-700
          pdf.text(`Délivré à : ${options.fallbackData.studentName}`, 15, 70);
        }

        // Details
        let y = 85;
        pdf.setFontSize(11);
        pdf.setTextColor(51, 65, 85);
        pdf.setFont("helvetica", "normal");

        if (options?.fallbackData?.details) {
          options.fallbackData.details.forEach((line) => {
            pdf.text(`• ${line}`, 15, y);
            y += 10;
          });
        } else {
          pdf.text("Ce document atteste de l'authenticité des données de l'écosystème SEN AURA TECH.", 15, y);
          y += 10;
          pdf.text(`Date d'émission : ${new Date().toLocaleDateString("fr-FR")}`, 15, y);
        }

        // Footer
        pdf.setDrawColor(203, 213, 225);
        pdf.line(15, 180, width - 15, 180);

        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139);
        pdf.text("SEN AURA TECH S.A.R.L. • Dakar, Sénégal • www.senauratech.com", 15, 190);

        pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
        return true;
      } catch (fallbackErr) {
        console.error("Critical PDF Fallback error:", fallbackErr);
        return false;
      }
    }
  }
}

/**
 * Generates and downloads a clean, professional PDF file on demand for any document
 * (Course notes, diagnostic reports, contracts, deliverables, invoices).
 */
export function generateGenericPDF(
  fileName: string,
  docTitle: string,
  category: string,
  sections: { title: string; content: string }[]
) {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Dark Navy Header
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, 210, 40, "F");

    pdf.setTextColor(245, 158, 11); // amber-500
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("SEN AURA TECH SÉNÉGAL", 15, 18);

    pdf.setTextColor(203, 213, 225); // slate-300
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${category.toUpperCase()} • DOCUMENT OFFICIEL`, 15, 27);

    const formattedDate = new Date().toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    pdf.text(`Dakar, le ${formattedDate}`, 150, 27);

    // Document Main Title
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    
    // Wrap title if long
    const titleLines = pdf.splitTextToSize(docTitle, 180);
    pdf.text(titleLines, 15, 52);

    let currentY = 52 + titleLines.length * 8 + 5;

    // Divider Line
    pdf.setDrawColor(245, 158, 11);
    pdf.setLineWidth(0.8);
    pdf.line(15, currentY, 195, currentY);
    currentY += 12;

    // Sections
    sections.forEach((sec) => {
      if (currentY > 260) {
        pdf.addPage();
        currentY = 20;
      }

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(180, 83, 9); // amber-700
      pdf.text(sec.title, 15, currentY);
      currentY += 7;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(51, 65, 85); // slate-700

      const lines = pdf.splitTextToSize(sec.content, 180);
      lines.forEach((line: string) => {
        if (currentY > 270) {
          pdf.addPage();
          currentY = 20;
        }
        pdf.text(line, 15, currentY);
        currentY += 5.5;
      });

      currentY += 6;
    });

    // Footer
    if (currentY > 265) {
      pdf.addPage();
      currentY = 250;
    } else {
      currentY = 270;
    }

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.3);
    pdf.line(15, currentY, 195, currentY);

    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text("SEN AURA TECH S.A.R.L. — Avenue Léopold Sédar Senghor, Thiès, Sénégal", 15, currentY + 6);
    pdf.text("Authentification & NINEA: 0098452102Y2 • www.senauratech.com", 15, currentY + 10);

    const safeFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    pdf.save(safeFileName);
  } catch (err) {
    console.error("Error generating generic PDF:", err);
    console.error("Impossible de générer le fichier PDF. Veuillez réessayer.");
  }
}

/**
 * Generates a high-definition PNG base64 representation of the official SEN AURA TECH logo emblem
 * with its metallic silver/gold 'A' geometry, orbital ring, and Senegal flag details.
 */
export function getSenAuraLogoBase64(size = 320): string {
  if (typeof document === "undefined") return "";
  try {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const scale = size / 200;
    ctx.save();
    ctx.scale(scale, scale);

    // Background dark circle
    ctx.beginPath();
    ctx.arc(100, 100, 96, 0, Math.PI * 2);
    ctx.fillStyle = "#0B0F19";
    ctx.fill();
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Outer Gold Orbit Ring
    ctx.save();
    ctx.translate(100, 110);
    ctx.rotate((-22 * Math.PI) / 180);
    ctx.beginPath();
    ctx.ellipse(0, 0, 80, 24, 0, 0, Math.PI * 2);
    const orbitGrad = ctx.createLinearGradient(-80, 0, 80, 0);
    orbitGrad.addColorStop(0, "#FEF08A");
    orbitGrad.addColorStop(0.3, "#F59E0B");
    orbitGrad.addColorStop(0.7, "#D97706");
    orbitGrad.addColorStop(1, "#78350F");
    ctx.strokeStyle = orbitGrad;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = "rgba(245, 158, 11, 0.5)";
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.restore();

    // Left Silver Arm of 'A'
    ctx.beginPath();
    ctx.moveTo(90, 28);
    ctx.lineTo(38, 140);
    ctx.lineTo(62, 140);
    ctx.lineTo(90, 76);
    ctx.lineTo(105, 110);
    ctx.lineTo(80, 110);
    ctx.lineTo(75, 122);
    ctx.lineTo(112, 122);
    ctx.lineTo(120, 140);
    ctx.lineTo(144, 140);
    ctx.closePath();
    const silverGrad = ctx.createLinearGradient(38, 28, 144, 140);
    silverGrad.addColorStop(0, "#F8FAFC");
    silverGrad.addColorStop(0.35, "#CBD5E1");
    silverGrad.addColorStop(0.7, "#64748B");
    silverGrad.addColorStop(1, "#334155");
    ctx.fillStyle = silverGrad;
    ctx.fill();

    // Right Gold Arm of 'A'
    ctx.beginPath();
    ctx.moveTo(96, 28);
    ctx.lineTo(162, 140);
    ctx.lineTo(138, 140);
    ctx.lineTo(108, 80);
    ctx.closePath();
    const goldGrad = ctx.createLinearGradient(96, 28, 162, 140);
    goldGrad.addColorStop(0, "#FEF08A");
    goldGrad.addColorStop(0.3, "#F59E0B");
    goldGrad.addColorStop(0.7, "#D97706");
    goldGrad.addColorStop(1, "#78350F");
    ctx.fillStyle = goldGrad;
    ctx.fill();

    // Circuit Traces on Gold Arm
    ctx.strokeStyle = "#FEF08A";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(125, 90); ctx.lineTo(140, 90);
    ctx.moveTo(130, 105); ctx.lineTo(148, 105);
    ctx.moveTo(135, 120); ctx.lineTo(152, 120);
    ctx.stroke();

    // Glowing Nodes
    ctx.fillStyle = "#FEF08A";
    [ [140, 90], [148, 105], [152, 120] ].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Africa Wireframe in Gold
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.moveTo(85, 75);
    ctx.quadraticCurveTo(105, 70, 120, 80);
    ctx.quadraticCurveTo(128, 92, 122, 105);
    ctx.quadraticCurveTo(112, 118, 102, 128);
    ctx.quadraticCurveTo(98, 120, 90, 110);
    ctx.quadraticCurveTo(82, 98, 85, 75);
    ctx.stroke();
    ctx.setLineDash([]);

    // Senegal Point in Gold & Green
    ctx.fillStyle = "#008751";
    ctx.strokeStyle = "#FFCC00";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(78, 93, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Text "SEN"
    ctx.font = "900 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#008751";
    ctx.fillText("SEN", 100, 153);

    // Text "AURA TECH"
    ctx.font = "900 17px sans-serif";
    ctx.fillStyle = "#CBD5E1";
    ctx.fillText("AURA ", 80, 172);
    ctx.fillStyle = "#F59E0B";
    ctx.fillText("TECH", 120, 172);

    // Senegal Flag Stripe at bottom
    ctx.fillStyle = "#008751";
    ctx.fillRect(35, 180, 43, 3.5);
    ctx.fillStyle = "#FFCC00";
    ctx.fillRect(78, 180, 44, 3.5);
    ctx.fillStyle = "#E8112D";
    ctx.fillRect(122, 180, 43, 3.5);

    ctx.restore();
    return canvas.toDataURL("image/png");
  } catch (e) {
    console.warn("Could not generate SEN AURA logo canvas:", e);
    return "";
  }
}

/**
 * Converts a number into formal French text representation (e.g. 1500000 -> "un million cinq cent mille francs CFA.")
 */
export function numberToFrenchWords(num: number): string {
  if (isNaN(num) || num <= 0) return "zéro franc CFA.";

  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
  const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"];

  function convertBelowThousand(n: number): string {
    let res = "";
    const h = Math.floor(n / 100);
    const r = n % 100;

    if (h > 0) {
      if (h === 1) res += "cent";
      else res += units[h] + " cent";
      if (r === 0 && h > 1) res += "s";
    }

    if (r > 0) {
      if (res.length > 0) res += " ";
      if (r < 10) {
        res += units[r];
      } else if (r < 20) {
        res += teens[r - 10];
      } else {
        const t = Math.floor(r / 10);
        const u = r % 10;
        if (t === 7) {
          res += "soixante-" + (u === 1 ? "et-onze" : teens[u]);
        } else if (t === 9) {
          res += "quatre-vingt-" + teens[u];
        } else {
          if (u === 1 && t !== 8) {
            res += tens[t] + "-et-un";
          } else if (u > 0) {
            res += tens[t] + "-" + units[u];
          } else {
            res += tens[t] + (t === 8 ? "s" : "");
          }
        }
      }
    }
    return res;
  }

  let amount = Math.floor(num);
  let parts: string[] = [];

  const millions = Math.floor(amount / 1000000);
  amount %= 1000000;
  if (millions > 0) {
    if (millions === 1) parts.push("un million");
    else parts.push(convertBelowThousand(millions) + " millions");
  }

  const thousands = Math.floor(amount / 1000);
  amount %= 1000;
  if (thousands > 0) {
    if (thousands === 1) parts.push("mille");
    else parts.push(convertBelowThousand(thousands) + " mille");
  }

  if (amount > 0) {
    parts.push(convertBelowThousand(amount));
  }

  return parts.join(" ") + " francs CFA.";
}

export interface PDFInvoiceItem {
  description: string;
  quantity?: number;
  unitPriceFCFA?: number;
  totalFCFA: number;
}

export interface PDFInvoiceData {
  invoiceNumber?: string;
  transactionRef?: string;
  issueDate?: string;
  paymentStatus?: "PAYEE" | "EN_ATTENTE" | "ANNULEE" | string;
  documentType?: DocumentContextType | string;
  sellerInfo?: {
    companyName?: string;
    tagline?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    ninea?: string;
    rccm?: string;
  };
  clientInfo: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items: PDFInvoiceItem[];
  subtotalFCFA?: number;
  vatRate?: number;
  vatFCFA?: number;
  totalFCFA: number;
  totalEUR?: number;
  totalUSD?: number;
  paymentMethod?: string;
  notes?: string;
}

/**
 * Generates and downloads an official vector PDF invoice/receipt/devis matching context and SEN AURA TECH branding
 */
export function exportInvoicePDF(invoice: PDFInvoiceData, fileName?: string) {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const contextConfig = detectDocumentContext(invoice);
    const defaultDocTitle = `${contextConfig.headerTitle.replace(/\s+/g, "_")}_SENAURA_${invoice.invoiceNumber || "DOC"}.pdf`;
    const outputFileName = fileName || defaultDocTitle;
    let pageNum = 1;

    const addFooter = (p: number) => {
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      pdf.line(14, 283, 196, 283);

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 116, 139);
      pdf.text(`SEN AURA TECH • ${contextConfig.sellerDivision}`, 14, 288);
      pdf.text(`Page ${p}`, 196, 288, { align: "right" });
    };

    // 1. TOP HEADER (White clean layout with logo + company details)
    const logoBase64 = getSenAuraLogoBase64(320);
    if (logoBase64) {
      try {
        pdf.addImage(logoBase64, "PNG", 14, 10.5, 17.5, 17.5);
      } catch {
        pdf.setFillColor(15, 23, 42);
        pdf.roundedRect(14, 12, 16, 16, 2, 2, "F");
        pdf.setTextColor(245, 158, 11);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text("SA", 18.5, 22.5);
      }
    } else {
      pdf.setFillColor(15, 23, 42);
      pdf.roundedRect(14, 12, 16, 16, 2, 2, "F");
      pdf.setTextColor(245, 158, 11);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("SA", 18.5, 22.5);
    }

    // Seller Info
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text(invoice.sellerInfo?.companyName || "SEN AURA TECH", 35, 16.5);

    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(71, 85, 105);
    pdf.text(contextConfig.sellerDivision, 35, 21.5);
    pdf.text(`Tél. : ${invoice.sellerInfo?.phone || "+221 70 533 46 11"}`, 35, 25.5);
    pdf.text(`Site : ${invoice.sellerInfo?.website || "www.senauratech.com"}`, 35, 29.5);

    // Right Header Section
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text(contextConfig.headerTitle, 196, 17, { align: "right" });

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(71, 85, 105);
    pdf.text(`N° ${invoice.invoiceNumber || "SAT-2026-001"}`, 196, 23, { align: "right" });

    const formattedDate = new Date(invoice.issueDate || Date.now()).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    pdf.text(formattedDate, 196, 28, { align: "right" });
    pdf.setTextColor(180, 83, 9); // Amber-700
    pdf.setFont("helvetica", "bold");
    pdf.text(contextConfig.headerSubtitle, 196, 33, { align: "right" });

    // 2. GOLD DIVIDER BAR
    pdf.setFillColor(217, 119, 6); // gold/amber
    pdf.rect(14, 38, 182, 2.5, "F");

    // 3. SELLER / CLIENT BOX
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.3);
    pdf.rect(14, 44, 182, 30, "S");

    // Table Header Bar
    pdf.setFillColor(241, 245, 249);
    pdf.rect(14, 44, 182, 6.5, "F");
    pdf.line(14, 50.5, 196, 50.5);
    pdf.line(105, 44, 105, 74);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(71, 85, 105);
    pdf.text(contextConfig.sellerRoleLabel, 18, 48.5);
    pdf.text(contextConfig.clientRoleLabel, 109, 48.5);

    // Prestataire Details
    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text("SEN AURA TECH", 18, 55.5);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 65, 85);
    pdf.text(`Tél. : ${invoice.sellerInfo?.phone || "+221 70 533 46 11"}`, 18, 60);
    pdf.text("Sénégal", 18, 64.5);
    pdf.text(invoice.sellerInfo?.website || "www.senauratech.com", 18, 69);

    // Client Details
    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text(invoice.clientInfo.name || "Client Honoré", 109, 55.5);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 65, 85);
    pdf.text(invoice.clientInfo.address || "Dakar, Sénégal", 109, 60);
    pdf.text(`Tél. : ${invoice.clientInfo.phone || "+221 77 000 00 00"}`, 109, 64.5);
    if (invoice.clientInfo.email) {
      pdf.text(invoice.clientInfo.email, 109, 69);
    }

    // 4. OBJET SECTION
    let currentY = 80;
    pdf.setFontSize(9.5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text("Objet", 14, currentY);
    currentY += 4.5;

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 65, 85);

    const objetText = invoice.notes || contextConfig.defaultObjet;
    const wrappedObjet = pdf.splitTextToSize(objetText, 182);
    pdf.text(wrappedObjet, 14, currentY);
    currentY += wrappedObjet.length * 4.2 + 5;

    // 5. SECTION 1: ITEMS TABLE
    const totalFCFA = invoice.totalFCFA || invoice.subtotalFCFA || 0;
    const subtotalFCFA = invoice.subtotalFCFA || totalFCFA;

    const hasMultipleQuantities = (invoice.items || []).some(
      (it) => (it.quantity && it.quantity > 1) || (it.unitPriceFCFA && it.unitPriceFCFA > 0)
    ) || contextConfig.type === "BOUTIQUE" || contextConfig.type === "INFRASTRUCTURES_TECHNIQUES";

    pdf.setFontSize(9.5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text(`${contextConfig.section1Title} — ${Math.round(totalFCFA).toLocaleString("fr-FR")} FCFA`, 14, currentY);
    currentY += 4.5;

    // Table Header (Dark Navy)
    pdf.setFillColor(15, 23, 42);
    pdf.rect(14, currentY, 182, 6.5, "F");

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text(contextConfig.col1Header, 18, currentY + 4.5);

    if (hasMultipleQuantities) {
      pdf.text(contextConfig.col2Header || "Qté", 125, currentY + 4.5, { align: "center" });
      pdf.text(contextConfig.col3Header || "P.U. (FCFA)", 158, currentY + 4.5, { align: "right" });
    }
    pdf.text(contextConfig.colTotalHeader, 192, currentY + 4.5, { align: "right" });
    currentY += 6.5;

    // Items Loop
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(30, 41, 59);

    invoice.items.forEach((item, idx) => {
      if (currentY > 255) {
        addFooter(pageNum);
        pdf.addPage();
        pageNum++;
        currentY = 20;
      }

      if (idx % 2 === 1) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(14, currentY, 182, 6.5, "F");
      }

      pdf.setDrawColor(226, 232, 240);
      pdf.rect(14, currentY, 182, 6.5, "S");

      pdf.setFontSize(8);
      const descMaxWidth = hasMultipleQuantities ? 100 : 135;
      const descLines = pdf.splitTextToSize(item.description, descMaxWidth);
      pdf.text(descLines[0], 18, currentY + 4.5);

      if (hasMultipleQuantities) {
        const qty = item.quantity || 1;
        const unitPrice = item.unitPriceFCFA || Math.round(item.totalFCFA / qty);
        pdf.text(String(qty), 125, currentY + 4.5, { align: "center" });
        pdf.text(`${Math.round(unitPrice).toLocaleString("fr-FR")} FCFA`, 158, currentY + 4.5, { align: "right" });
      }

      pdf.text(`${Math.round(item.totalFCFA).toLocaleString("fr-FR")} FCFA`, 192, currentY + 4.5, { align: "right" });

      currentY += 6.5;
    });

    // Subtotal Row
    pdf.setFillColor(241, 245, 249);
    pdf.rect(14, currentY, 182, 6.5, "F");
    pdf.setDrawColor(203, 213, 225);
    pdf.rect(14, currentY, 182, 6.5, "S");

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text(contextConfig.totalSection1Label, 18, currentY + 4.5);
    pdf.text(`${Math.round(subtotalFCFA).toLocaleString("fr-FR")} FCFA`, 192, currentY + 4.5, { align: "right" });
    currentY += 10;

    // 6. SECTION 2: SERVICES & GARANTIES INCLUSES
    if (currentY > 225) {
      addFooter(pageNum);
      pdf.addPage();
      pageNum++;
      currentY = 20;
    }

    pdf.setFontSize(9.5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text(contextConfig.section2Title, 14, currentY);
    currentY += 4.5;

    // Table Header (Gold/Amber)
    pdf.setFillColor(217, 119, 6);
    pdf.rect(14, currentY, 182, 6.5, "F");

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text("Prestation / Garantie", 18, currentY + 4.5);
    pdf.text("Statut", 192, currentY + 4.5, { align: "right" });
    currentY += 6.5;

    contextConfig.section2Items.forEach((sItem, idx) => {
      if (idx % 2 === 1) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(14, currentY, 182, 6, "F");
      }
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(14, currentY, 182, 6, "S");

      pdf.setFontSize(7.8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(51, 65, 85);
      pdf.text(sItem.label, 18, currentY + 4.2);
      pdf.setTextColor(180, 83, 9);
      pdf.setFont("helvetica", "bold");
      pdf.text(sItem.value, 192, currentY + 4.2, { align: "right" });
      currentY += 6;
    });

    currentY += 8;

    // 7. RECAP & TOTAL TABLE
    if (currentY > 225) {
      addFooter(pageNum);
      pdf.addPage();
      pageNum++;
      currentY = 20;
    }

    const recapHeight = invoice.vatFCFA && invoice.vatFCFA > 0 ? 28 : 22;
    pdf.setDrawColor(203, 213, 225);
    pdf.setFillColor(255, 255, 255);
    pdf.rect(14, currentY, 182, recapHeight, "S");

    pdf.line(14, currentY + 7, 196, currentY + 7);
    if (invoice.vatFCFA && invoice.vatFCFA > 0) {
      pdf.line(14, currentY + 14, 196, currentY + 14);
      pdf.line(14, currentY + 21, 196, currentY + 21);
    } else {
      pdf.line(14, currentY + 14, 196, currentY + 14);
    }

    pdf.setFontSize(8.2);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 65, 85);
    pdf.text(contextConfig.recapRow1Label, 18, currentY + 5);
    pdf.text(`${Math.round(subtotalFCFA).toLocaleString("fr-FR")} FCFA`, 192, currentY + 5, { align: "right" });

    pdf.text(contextConfig.recapRow2Label, 18, currentY + 12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(180, 83, 9);
    pdf.text(contextConfig.recapRow2Value, 192, currentY + 12, { align: "right" });

    let finalRowY = currentY + 14;
    if (invoice.vatFCFA && invoice.vatFCFA > 0) {
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(51, 65, 85);
      pdf.text(`TVA (${invoice.vatRate || 18}%)`, 18, currentY + 19);
      pdf.text(`${Math.round(invoice.vatFCFA).toLocaleString("fr-FR")} FCFA`, 192, currentY + 19, { align: "right" });
      finalRowY = currentY + 21;
    }

    pdf.setFillColor(241, 245, 249);
    pdf.rect(14, finalRowY, 182, 7.5, "F");

    pdf.setFontSize(8.8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text(contextConfig.recapTotalLabel, 18, finalRowY + 5.2);
    pdf.setTextColor(217, 119, 6);
    pdf.text(`${Math.round(totalFCFA).toLocaleString("fr-FR")} FCFA`, 192, finalRowY + 5.2, { align: "right" });

    currentY = finalRowY + 14;

    // 8. WRITTEN AMOUNT IN WORDS
    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(15, 23, 42);
    pdf.text(`Arrêtée à la somme de : ${numberToFrenchWords(totalFCFA)}`, 14, currentY);

    currentY += 8;

    // 9. LEGAL FOOTNOTE & STAMP
    pdf.setFontSize(7.5);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(100, 116, 139);
    pdf.text(contextConfig.footerLegalText, 14, currentY);
    pdf.text("NINEA: 0098452102Y2 • RCCM: SN.DKR.2025.B.14820 • SEN AURA TECH S.A.R.L.", 14, currentY + 4);

    addFooter(pageNum);

    const safeName = outputFileName.endsWith(".pdf") ? outputFileName : `${outputFileName}.pdf`;
    pdf.save(safeName);
    return true;
  } catch (err) {
    console.error("Error exporting invoice PDF:", err);
    console.error("Erreur lors de l'exportation du document en PDF.");
    return false;
  }
}

export interface PDFQuoteData {
  id: string;
  reference?: string;
  pole: string;
  serviceTitle: string;
  description: string;
  region: string;
  budgetFCFA: number;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  status?: string;
  createdAt?: string;
  validityDays?: number;
  items?: { description: string; totalFCFA: number }[];
  infrastructureItems?: { description: string; totalFCFA: number | string }[];
}

/**
 * Generates and downloads an executive-grade, vector PDF file for a Quote / Devis
 * matching official SEN AURA TECH branding with the company logo emblem.
 */
export function exportQuotePDF(quote: PDFQuoteData, fileName?: string) {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const quoteRef = quote.reference || quote.id || `SAT-2026-DEV-${Math.floor(100 + Math.random() * 900)}`;
    const outputFileName = fileName || `Devis_SENAURA_${quoteRef}.pdf`;
    let pageNum = 1;

    const addFooter = (p: number) => {
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      pdf.line(14, 283, 196, 283);

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 116, 139);
      pdf.text("SEN AURA TECH • Solutions numériques & ingénierie logicielle", 14, 288);
      pdf.text(`Page ${p}`, 196, 288, { align: "right" });
    };

    // 1. TOP HEADER (White clean layout with logo + company details)
    const logoBase64 = getSenAuraLogoBase64(320);
    if (logoBase64) {
      try {
        pdf.addImage(logoBase64, "PNG", 14, 10.5, 17.5, 17.5);
      } catch {
        pdf.setFillColor(15, 23, 42);
        pdf.roundedRect(14, 12, 16, 16, 2, 2, "F");
        pdf.setTextColor(245, 158, 11);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text("SA", 18.5, 22.5);
      }
    } else {
      pdf.setFillColor(15, 23, 42);
      pdf.roundedRect(14, 12, 16, 16, 2, 2, "F");
      pdf.setTextColor(245, 158, 11);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("SA", 18.5, 22.5);
    }

    // Company Information
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("SEN AURA TECH", 35, 16.5);

    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(71, 85, 105);
    pdf.text("Solutions numériques & ingénierie logicielle", 35, 21.5);
    pdf.text("Tél. : +221 70 533 46 11", 35, 25.5);
    pdf.text("Site : papa-malick-teuw-dev-ia.vercel.app", 35, 29.5);

    // Right Header Section (Title, Ref, Date, Category)
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text("DEVIS", 196, 18, { align: "right" });

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(71, 85, 105);
    pdf.text(`N° ${quoteRef.startsWith("SAT-") ? quoteRef : `SAT-${quoteRef}`}`, 196, 24, { align: "right" });

    const quoteDate = quote.createdAt ? new Date(quote.createdAt) : new Date();
    const formattedDate = quoteDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    pdf.text(formattedDate, 196, 29, { align: "right" });

    const shortTitle = quote.serviceTitle?.length > 32 ? quote.serviceTitle.slice(0, 30) + "..." : quote.serviceTitle || "Solutions Digitales";
    pdf.text(shortTitle, 196, 34, { align: "right" });

    // 2. GOLD / AMBER ACCENT DIVIDER BAR
    pdf.setFillColor(217, 119, 6);
    pdf.rect(14, 38, 182, 2.8, "F");

    // 3. PRESTATAIRE / CLIENT DUAL BOX
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.3);
    pdf.rect(14, 44, 182, 29, "S");

    // Header sub-bar
    pdf.setFillColor(241, 245, 249);
    pdf.rect(14, 44, 182, 6.5, "F");
    pdf.line(14, 50.5, 196, 50.5);
    pdf.line(105, 44, 105, 73);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(71, 85, 105);
    pdf.text("PRESTATAIRE", 18, 48.5);
    pdf.text("CLIENT", 109, 48.5);

    // Left Column: Prestataire details
    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text("SEN AURA TECH", 18, 55.5);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 65, 85);
    pdf.text("Tél. : +221 70 533 46 11", 18, 60);
    pdf.text("Sénégal", 18, 64.5);
    pdf.text("papa-malick-teuw-dev-ia.vercel.app", 18, 69);

    // Right Column: Client details
    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text(quote.userName || "Client B2B / Particulier", 109, 55.5);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 65, 85);
    pdf.text(`${quote.region || "Dakar"}, Sénégal`, 109, 60);
    pdf.text(`Tél. : ${quote.userPhone || "+221 77 000 00 00"}`, 109, 64.5);
    pdf.text(quote.userEmail || "contact@client.sn", 109, 69);

    // 4. OBJET SECTION
    let currentY = 79;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text("Objet", 14, currentY);
    currentY += 5;

    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 65, 85);

    const objetText = quote.description || `Conception, développement et mise en ligne des solutions numériques pour ${quote.userName || "le client"}, avec accompagnement technique et déploiement de l'infrastructure de production.`;
    const wrappedObjet = pdf.splitTextToSize(objetText, 182);
    pdf.text(wrappedObjet, 14, currentY);
    currentY += wrappedObjet.length * 4.2 + 5;

    // Budget Calculations
    const totalBudget = Math.round(quote.budgetFCFA) || 560000;
    
    // Divide intelligently into Development & Infrastructure
    let devBudget = totalBudget;
    let infraBudget = 0;
    let infraIsIncluded = false;

    if (totalBudget >= 300000) {
      infraBudget = 60000;
      devBudget = totalBudget - infraBudget;
    } else if (totalBudget >= 150000) {
      infraBudget = 30000;
      devBudget = totalBudget - infraBudget;
    } else {
      infraIsIncluded = true;
      devBudget = totalBudget;
    }

    // 5. SECTION 1: PRESTATIONS & MAIN-D'ŒUVRE
    if (currentY > 220) {
      addFooter(pageNum);
      pdf.addPage();
      pageNum++;
      currentY = 20;
    }

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text(`1. Développement & Prestations — ${devBudget.toLocaleString("fr-FR")} FCFA`, 14, currentY);
    currentY += 5;

    // Prestations Table Header (Dark Navy)
    pdf.setFillColor(15, 23, 42);
    pdf.rect(14, currentY, 182, 6.5, "F");

    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text("Prestation", 18, currentY + 4.5);
    pdf.text("Montant", 192, currentY + 4.5, { align: "right" });
    currentY += 6.5;

    // Items calculation
    const part1 = Math.round((devBudget * 0.15) / 1000) * 1000;
    const part2 = Math.round((devBudget * 0.20) / 1000) * 1000;
    const part3 = Math.round((devBudget * 0.45) / 1000) * 1000;
    const part4 = devBudget - (part1 + part2 + part3);

    const devItems: { name: string; amount: number }[] = quote.items && quote.items.length > 0
      ? quote.items.map(it => ({ name: it.description, amount: it.totalFCFA }))
      : [
          { name: "Cadrage technique, spécifications & architecture de la solution", amount: part1 },
          { name: "Design d'interface UI/UX moderne, ergonomique et responsive", amount: part2 },
          { name: "Développement technique, intégration frontend/backend & sécurité", amount: part3 },
          { name: "Tests complets, recette fonctionnelle, mise en ligne & formation", amount: part4 },
        ];

    pdf.setFont("helvetica", "normal");
    devItems.forEach((item, idx) => {
      if (currentY > 255) {
        addFooter(pageNum);
        pdf.addPage();
        pageNum++;
        currentY = 20;
      }

      if (idx % 2 === 1) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(14, currentY, 182, 6.2, "F");
      }
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(14, currentY, 182, 6.2, "S");

      pdf.setFontSize(8);
      pdf.setTextColor(51, 65, 85);
      const descLines = pdf.splitTextToSize(item.name, 130);
      pdf.text(descLines[0], 18, currentY + 4.2);
      pdf.text(`${item.amount.toLocaleString("fr-FR")} FCFA`, 192, currentY + 4.2, { align: "right" });
      currentY += 6.2;
    });

    // Subtotal Row
    pdf.setFillColor(241, 245, 249);
    pdf.rect(14, currentY, 182, 6.5, "F");
    pdf.setDrawColor(203, 213, 225);
    pdf.rect(14, currentY, 182, 6.5, "S");

    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text("Total prestations", 18, currentY + 4.5);
    pdf.text(`${devBudget.toLocaleString("fr-FR")} FCFA`, 192, currentY + 4.5, { align: "right" });
    currentY += 10;

    // 6. SECTION 2: INFRASTRUCTURE & SERVICES
    if (currentY > 220) {
      addFooter(pageNum);
      pdf.addPage();
      pageNum++;
      currentY = 20;
    }

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    const infraSectionTitle = infraIsIncluded
      ? "2. Infrastructure — incluse"
      : `2. Infrastructure — ${infraBudget.toLocaleString("fr-FR")} FCFA`;
    pdf.text(infraSectionTitle, 14, currentY);
    currentY += 5;

    // Table Header (Amber / Gold)
    pdf.setFillColor(217, 119, 6);
    pdf.rect(14, currentY, 182, 6.5, "F");

    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text("Poste", 18, currentY + 4.5);
    pdf.text("Montant", 192, currentY + 4.5, { align: "right" });
    currentY += 6.5;

    const infraItems = [
      { name: "Nom de domaine — 1 an", cost: infraIsIncluded ? "Inclus" : "15 000 FCFA" },
      { name: "Hébergement / environnement production — 1 an", cost: infraIsIncluded ? "Inclus" : "20 000 FCFA" },
      { name: "Base PostgreSQL & Stockage fichiers / médias — 1 an", cost: infraIsIncluded ? "Inclus" : "10 000 FCFA" },
      { name: "Emails transactionnels & configuration SSL / HTTPS", cost: "Inclus" },
      { name: "Sauvegardes & sécurité de base", cost: infraIsIncluded ? "Inclus" : "5 000 FCFA" },
      { name: "Monitoring / logs de base & CI/CD production", cost: infraIsIncluded ? "Inclus" : "10 000 FCFA" },
    ];

    infraItems.forEach((infra, idx) => {
      if (currentY > 255) {
        addFooter(pageNum);
        pdf.addPage();
        pageNum++;
        currentY = 20;
      }

      if (idx % 2 === 1) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(14, currentY, 182, 6.0, "F");
      }
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(14, currentY, 182, 6.0, "S");

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(51, 65, 85);
      pdf.text(infra.name, 18, currentY + 4.1);
      pdf.text(infra.cost, 192, currentY + 4.1, { align: "right" });
      currentY += 6.0;
    });

    if (!infraIsIncluded) {
      pdf.setFillColor(241, 245, 249);
      pdf.rect(14, currentY, 182, 6.5, "F");
      pdf.setDrawColor(203, 213, 225);
      pdf.rect(14, currentY, 182, 6.5, "S");

      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text("Total infrastructure", 18, currentY + 4.5);
      pdf.text(`${infraBudget.toLocaleString("fr-FR")} FCFA`, 192, currentY + 4.5, { align: "right" });
      currentY += 6.5;
    }

    currentY += 6;

    // 7. SUMMARY & TOTAL À PAYER TABLE
    if (currentY > 225) {
      addFooter(pageNum);
      pdf.addPage();
      pageNum++;
      currentY = 20;
    }

    pdf.setDrawColor(203, 213, 225);
    pdf.setFillColor(255, 255, 255);
    pdf.rect(14, currentY, 182, 21, "S");

    pdf.line(14, currentY + 7, 196, currentY + 7);
    pdf.line(14, currentY + 14, 196, currentY + 14);

    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 65, 85);
    pdf.text("Développement / prestations techniques", 18, currentY + 4.8);
    pdf.text(`${devBudget.toLocaleString("fr-FR")} FCFA`, 192, currentY + 4.8, { align: "right" });

    pdf.text("Infrastructure / mise en production", 18, currentY + 11.8);
    pdf.text(infraIsIncluded ? "Inclus" : `${infraBudget.toLocaleString("fr-FR")} FCFA`, 192, currentY + 11.8, { align: "right" });

    pdf.setFillColor(241, 245, 249);
    pdf.rect(14, currentY + 14, 182, 7, "F");

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text("TOTAL DU DEVIS (TTC)", 18, currentY + 19);
    pdf.text(`${totalBudget.toLocaleString("fr-FR")} FCFA`, 192, currentY + 19, { align: "right" });

    currentY += 27;

    // 8. WRITTEN AMOUNT IN WORDS
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(15, 23, 42);
    pdf.text(`Arrêtée à la somme de : ${numberToFrenchWords(totalBudget)}`, 14, currentY);

    currentY += 8;

    // 9. SIGNATURES & STAMPS
    if (currentY > 235) {
      addFooter(pageNum);
      pdf.addPage();
      pageNum++;
      currentY = 20;
    }

    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text("Bon pour accord et validation client :", 14, currentY);
    pdf.text("Pour SEN AURA TECH S.A.R.L. :", 110, currentY);

    currentY += 4.5;

    pdf.setDrawColor(203, 213, 225);
    pdf.roundedRect(14, currentY, 84, 26, 2, 2, "S");
    pdf.roundedRect(110, currentY, 86, 26, 2, 2, "S");

    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(148, 163, 184);
    pdf.text("Date, Nom & Signature précédée de 'Lu et approuvé'", 17, currentY + 5);
    pdf.text("Cachet officiel Direction Technique Dakar", 113, currentY + 5);

    // Cachet text inside stamp box
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.setFont("helvetica", "bold");
    pdf.text("SEN AURA TECH S.A.R.L.", 113, currentY + 14);
    pdf.setFont("helvetica", "normal");
    pdf.text("Direction des Projets & Ingénierie", 113, currentY + 18.5);
    pdf.text("Avenue Léopold Sédar Senghor, Thiès", 113, currentY + 22.5);

    addFooter(pageNum);

    const safeName = outputFileName.endsWith(".pdf") ? outputFileName : `${outputFileName}.pdf`;
    pdf.save(safeName);
    return true;
  } catch (err) {
    console.error("Error exporting quote PDF:", err);
    console.error("Erreur lors de l'exportation du devis en PDF.");
    return false;
  }
}

/**
 * Generates an executive-grade, multi-page Official Presentation PDF for SEN AURA TECH.
 */
export function generateOfficialPresentationPDF(fileName = "presentation-officielle-sen-aura-tech.pdf"): boolean {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;

    // ==========================================
    // PAGE 1: COVER SLIDE / PAGE DE GARDE
    // ==========================================
    // Deep Navy / Obsidian Background
    pdf.setFillColor(11, 15, 25);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // Decorative Geometric Glow Accents
    pdf.setFillColor(245, 158, 11);
    pdf.circle(180, 40, 60, "F");
    pdf.setFillColor(14, 165, 233);
    pdf.circle(20, 260, 50, "F");

    // Overlay to smooth circles
    pdf.setFillColor(11, 15, 25);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // Gold Top Banner Accent
    pdf.setFillColor(245, 158, 11);
    pdf.rect(0, 0, pageWidth, 6, "F");

    // Logo / Brand Monogram
    pdf.setFillColor(245, 158, 11);
    pdf.roundedRect(25, 45, 32, 32, 4, 4, "F");
    pdf.setTextColor(11, 15, 25);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("SAT", 32, 66);

    // Main Header
    pdf.setTextColor(245, 158, 11);
    pdf.setFontSize(28);
    pdf.setFont("helvetica", "bold");
    pdf.text("SEN AURA TECH", 65, 58);

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text("INGÉNIERIE TECHNOLOGIQUE & ÉNERGIES RENOUVELABLES", 65, 68);

    // Gold Divider
    pdf.setDrawColor(245, 158, 11);
    pdf.setLineWidth(1.2);
    pdf.line(25, 95, 185, 95);

    // Large Document Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(30);
    pdf.setFont("helvetica", "bold");
    pdf.text("DOSSIER INSTITUTIONNEL", 25, 125);
    pdf.text("& CATALOGUE DE SOLUTIONS", 25, 140);

    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.text("La référence des solutions technologiques et solaires au Sénégal", 25, 155);

    // Key Highlights Pillars (3 Cards)
    const pillars = [
      { title: "SOLAIRE HYBRIDE", desc: "Centrales autonomes 24/7 & batteries Lithium garanties 10 ans." },
      { title: "LOGICIEL & ERP", desc: "Applications Web, Mobiles & digitalisation des entreprises." },
      { title: "SÉCURITÉ IA & RÉSEAUX", desc: "Vidéosurveillance 4K, biométrie & infrastructures télécoms." }
    ];

    let pilY = 175;
    pillars.forEach((p, idx) => {
      pdf.setFillColor(22, 30, 49);
      pdf.setDrawColor(245, 158, 11);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(25, pilY, 160, 22, 3, 3, "FD");

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(245, 158, 11);
      pdf.text(`0${idx + 1}.  ${p.title}`, 32, pilY + 9);

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(203, 213, 225);
      pdf.text(p.desc, 32, pilY + 16);

      pilY += 27;
    });

    // Cover Footer
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(245, 158, 11);
    pdf.text("ÉDITION NATIONALE 2026 - 2027", 25, 275);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(148, 163, 184);
    pdf.text("Dakar Plateau, Sénégal • www.senauratech.com • +221 70 533 46 11", 25, 282);

    // ==========================================
    // PAGE 2: VISION, MISSION & CHIFFRES CLÉS
    // ==========================================
    pdf.addPage();

    // Top Header Banner
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, 28, "F");

    pdf.setTextColor(245, 158, 11);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("SEN AURA TECH SÉNÉGAL", 15, 14);

    pdf.setTextColor(203, 213, 225);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text("PRÉSENTATION DE L'ENTREPRISE & VISION NATIONALE", 15, 21);

    // Section 1: Qui Sommes-Nous
    let contentY = 42;
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("1. À PROPOS DE SEN AURA TECH", 15, contentY);
    contentY += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 65, 85);
    const aboutText = "SEN AURA TECH est une entreprise sénégalaise pionnière, spécialisée dans l'ingénierie des hautes technologies, la transition énergétique solaire et le développement logiciel pour le secteur public et privé. Notre mission est d'accélérer l'autonomie technologique et énergétique des ménages, PME et grandes institutions à travers tout le Sénégal et la sous-région.";
    const wrappedAbout = pdf.splitTextToSize(aboutText, 180);
    pdf.text(wrappedAbout, 15, contentY);
    contentY += wrappedAbout.length * 5.5 + 8;

    // Chiffres Clés (4 Metric Boxes)
    pdf.setTextColor(180, 83, 9);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("CHIFFRES CLÉS & RAYONNEMENT :", 15, contentY);
    contentY += 6;

    const stats = [
      { num: "500+", label: "Installations Solaires & Vidéo" },
      { num: "14", label: "Régions du Sénégal Couvertes" },
      { num: "99.8%", label: "Taux de Satisfaction Clients" },
      { num: "24/7", label: "Support Technique & Télésurveillance" }
    ];

    const boxW = 42;
    stats.forEach((st, i) => {
      const bX = 15 + i * 46;
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(bX, contentY, boxW, 22, 2, 2, "FD");

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(st.num, bX + 6, contentY + 9);

      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      const wrappedLabel = pdf.splitTextToSize(st.label, 36);
      pdf.text(wrappedLabel, bX + 6, contentY + 15);
    });

    contentY += 32;

    // Section 2: Nos 4 Pôles d'Excellence
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("2. NOS 4 PÔLES D'ACTIVITÉS PRINCIPAUX", 15, contentY);
    contentY += 8;

    const poles = [
      {
        title: "PÔLE ÉNERGIE & SOLAIRE HYBRIDE",
        desc: "Ingénierie, dimensionnement et fourniture de systèmes solaires photovoltaïques autonomes, onduleurs hybrides Pure Sine et parcs de stockage Lithium LiFePO4 pour éliminer les coupures d'électricité."
      },
      {
        title: "PÔLE DIGITAL & ÉDITION DE LOGICIELS",
        desc: "Développement d'applications Web et Mobiles sur-mesure, plateformes ERP de gestion commerciale, systèmes de facturation et intégration des passerelles de paiement (Wave, Orange Money)."
      },
      {
        title: "PÔLE SÉCURITÉ ÉLECTRONIQUE & IA",
        desc: "Systèmes de vidéosurveillance 4K Dahua/Hikvision avec intelligence artificielle (détection humaine et franchissement), alarmes anti-intrusion sans fil et contrôle d'accès biométrique."
      },
      {
        title: "PÔLE FORMATION (SEN AURA ACADEMY)",
        desc: "Certifications pratiques et professionnalisantes en énergie solaire, cybersécurité, développement fullstack et intelligence artificielle délivrées à nos campus de Dakar et Thiès."
      }
    ];

    poles.forEach((pol, idx) => {
      pdf.setFillColor(idx % 2 === 0 ? 254 : 241, idx % 2 === 0 ? 243 : 245, idx % 2 === 0 ? 199 : 249);
      pdf.setDrawColor(245, 158, 11);
      pdf.setLineWidth(0.2);
      pdf.roundedRect(15, contentY, 180, 24, 2, 2, "FD");

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(180, 83, 9);
      pdf.text(`● ${pol.title}`, 20, contentY + 7);

      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(51, 65, 85);
      const pText = pdf.splitTextToSize(pol.desc, 170);
      pdf.text(pText, 20, contentY + 13);

      contentY += 28;
    });

    // Page 2 Footer
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text("Page 2/3 — Dossier Institutionnel SEN AURA TECH", 15, 285);

    // ==========================================
    // PAGE 3: CATALOGUE DES OFFRES & CONTACTS
    // ==========================================
    pdf.addPage();

    // Top Header Banner
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, 28, "F");

    pdf.setTextColor(245, 158, 11);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("SEN AURA TECH SÉNÉGAL", 15, 14);

    pdf.setTextColor(203, 213, 225);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text("SOLUTIONS COMMERCIALES CLÉ EN MAIN & CONTACTS", 15, 21);

    contentY = 38;
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("3. PACKS POPULAIRES RECOMMANDÉS", 15, contentY);
    contentY += 7;

    const commercialPacks = [
      {
        name: "PACK VILLA SOLAIRE SÉRÉNITÉ (5.5 KVA)",
        price: "À partir de 1 200 000 FCFA",
        spec: "Onduleur Hybride 5.5KVA + 4 Panneaux Monocristallins 550W + Batterie Lithium 4.8kWh. Autonomie totale 24h/24 sans interruption."
      },
      {
        name: "PACK VIDÉOSURVEILLANCE 4K CONNECTÉE (4 CAMÉRAS)",
        price: "À partir de 295 000 FCFA",
        spec: "4 caméras Dahua vision nocturne couleur + Enregistreur NVR 1To + Application mobile sans abonnement. Alertes instantanées sur smartphone."
      },
      {
        name: "ERP GESTION COMMERCIALE & STOCK SEN AURA",
        price: "À partir de 500 000 FCFA",
        spec: "Licence complète gestion des ventes, caisse tactile, inventaire automatique, rapports financiers et support d'intégration."
      },
      {
        name: "DÉVELOPPEMENT D'APPLICATION SUR-MESURE",
        price: "Sur Devis (Dès 1 500 000 FCFA)",
        spec: "Conception UI/UX, architecture Cloud sécurisée, passerelle Wave/OM/Carte bancaire, formation des administrateurs."
      }
    ];

    commercialPacks.forEach((cp) => {
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(203, 213, 225);
      pdf.roundedRect(15, contentY, 180, 26, 2, 2, "FD");

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(cp.name, 20, contentY + 7);

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(217, 119, 6);
      pdf.text(cp.price, 125, contentY + 7);

      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      const sp = pdf.splitTextToSize(cp.spec, 170);
      pdf.text(sp, 20, contentY + 13);

      contentY += 30;
    });

    contentY += 4;

    // Contact and Engagement Box
    pdf.setFillColor(15, 23, 42);
    pdf.roundedRect(15, contentY, 180, 68, 4, 4, "F");

    pdf.setTextColor(245, 158, 11);
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text("CONTACT & PRISE DE RENDEZ-VOUS :", 22, contentY + 12);

    pdf.setFontSize(9.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(255, 255, 255);
    pdf.text("• Siège Social : Avenue Léopold Sédar Senghor, Thiès, Sénégal", 22, contentY + 22);
    pdf.text("• Bureau Régional Dakar : Dakar Plateau, Sénégal", 22, contentY + 29);
    pdf.text("• Ligne Directe & WhatsApp Pro : +221 70 533 46 11 / +221 33 800 00 00", 22, contentY + 36);
    pdf.text("• Courriel Officiel : contact@senauratech.sn / direction@senauratech.sn", 22, contentY + 43);
    pdf.text("• Portail Digital Web : https://www.senauratech.com", 22, contentY + 50);

    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text("NINEA : 0098452102Y2 • Registre du Commerce de Dakar • Agrément National", 22, contentY + 60);

    // Save PDF
    const cleanFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    pdf.save(cleanFileName);
    return true;
  } catch (err) {
    console.error("Error generating official presentation PDF:", err);
    console.error("Erreur lors de la génération de la présentation officielle PDF.");
    return false;
  }
}

/**
 * Generates an ultra-detailed Commercial Brochure PDF for 4K Surveillance and Hybrid Solar.
 */
export function generateSolarSecurityBrochurePDF(fileName = "brochure-cameras-solaire-sen-aura-tech.pdf"): boolean {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;

    // Header
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, 35, "F");

    pdf.setTextColor(245, 158, 11);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("SEN AURA TECH SÉNÉGAL", 15, 16);

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("BROCHURE COMMERCIALE & TECHNIQUE : SOLAIRE & VIDÉOSURVEILLANCE IA", 15, 25);

    let y = 46;

    // Section 1
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("1. GAMME ÉNERGIE SOLAIRE HYBRIDE (ZÉRO COUPURE SENELEC)", 15, y);
    y += 8;

    pdf.setFillColor(254, 243, 199);
    pdf.roundedRect(15, y, 180, 50, 2, 2, "F");
    pdf.setTextColor(180, 83, 9);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("KIT SOLAIRE HYBRIDE 5.5KVA & 10KVA PURE SINE", 20, y + 8);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 65, 85);
    pdf.text("• Onduleur nouvelle génération avec double tracker MPPT haute efficacité.", 20, y + 16);
    pdf.text("• Batteries Lithium Fer Phosphate (LiFePO4) garanties 6000 cycles (>10 ans).", 20, y + 23);
    pdf.text("• Bascule instantanée en 10ms en cas de coupure du réseau public (aucune extinction).", 20, y + 30);
    pdf.text("• Application mobile de monitoring en temps réel de votre production et consommation.", 20, y + 37);
    pdf.text("• Prix indicatif : Dès 1 200 000 FCFA clés en main (matériel + pose certifiée).", 20, y + 44);

    y += 58;

    // Section 2
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("2. GAMME VIDÉOSURVEILLANCE 4K & DÉTECTION INTELLIGENTE", 15, y);
    y += 8;

    pdf.setFillColor(240, 249, 255);
    pdf.roundedRect(15, y, 180, 50, 2, 2, "F");
    pdf.setTextColor(3, 105, 161);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("PACKS CAMÉRAS DAHUA / HIKVISION 4K SMART COLOR", 20, y + 8);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 65, 85);
    pdf.text("• Vision nocturne haute définition en couleurs 24h/24 (Technologie Full-Color).", 20, y + 16);
    pdf.text("• Détection de formes humaines et véhicules par IA (élimination des fausses alertes).", 20, y + 23);
    pdf.text("• Sirène intégrée et projecteur dissuasif en cas de franchissement de périmètre.", 20, y + 30);
    pdf.text("• Enregistreur NVR sécurisé avec disque dur haute endurance pour 30 jours d'historique.", 20, y + 37);
    pdf.text("• Prix indicatif : Dès 295 000 FCFA avec installation et paramétrage smartphone.", 20, y + 44);

    y += 60;

    // Section 3: Engagement & Garantie
    pdf.setFillColor(15, 23, 42);
    pdf.roundedRect(15, y, 180, 48, 3, 3, "F");

    pdf.setTextColor(245, 158, 11);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("ENGAGEMENTS SEN AURA TECH :", 22, y + 10);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(255, 255, 255);
    pdf.text("✔ Garantie constructeur 2 à 10 ans sur tous nos équipements.", 22, y + 19);
    pdf.text("✔ Visite technique préalable et devis dimensionné sous 24h ouvrées.", 22, y + 27);
    pdf.text("✔ Équipe d'ingénieurs et techniciens sénégalais certifiés.", 22, y + 35);
    pdf.text("✔ SAV et maintenance préventive assurés sur l'ensemble du territoire national.", 22, y + 43);

    y += 58;

    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text("SEN AURA TECH S.A.R.L. • Dakar, Sénégal • Tél: +221 70 533 46 11 • contact@senauratech.sn", 15, 285);

    const cleanFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    pdf.save(cleanFileName);
    return true;
  } catch (err) {
    console.error("Error generating solar brochure PDF:", err);
    return false;
  }
}

/**
 * Generates an HD marketing sheet PDF for Digital Solutions & ERP.
 */
export function generateDigitalERPAffichePDF(fileName = "affiche-solutions-digitales-erp.pdf"): boolean {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;

    // Background
    pdf.setFillColor(11, 15, 25);
    pdf.rect(0, 0, pageWidth, 297, "F");

    pdf.setFillColor(245, 158, 11);
    pdf.rect(0, 0, pageWidth, 5, "F");

    // Header
    pdf.setTextColor(245, 158, 11);
    pdf.setFontSize(26);
    pdf.setFont("helvetica", "bold");
    pdf.text("SEN AURA TECH", 15, 28);

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("SOLUTIONS DIGITALES & LOGICIELS ERP", 15, 40);

    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text("Digitalisez vos opérations, boostez votre rentabilité.", 15, 48);

    // Feature Blocks
    const features = [
      {
        title: "LOGICIEL ERP & GESTION COMMERCIALE",
        points: ["Gestion de stocks multi-boutiques en temps réel", "Point de vente tactile (POS) et facturation normalisée", "Suivi des dettes clients, fournisseurs et trésorerie", "Statistiques de rentabilité et marges automatiques"]
      },
      {
        title: "APPLICATIONS WEB & MOBILES SUR-MESURE",
        points: ["Sites e-commerce et catalogues interactifs", "Intégration instantanée des paiements Wave & Orange Money", "Espace client sécurisé et notifications SMS automatiques", "Applications Android & iOS natives ultra-performantes"]
      },
      {
        title: "CYBERSÉCURITÉ & INFRASTRUCTURES CLOUD",
        points: ["Sauvegardes automatiques chiffrées sur Cloud sécurisé", "Audit de sécurité réseau et pare-feu d'entreprise", "Mise en conformité CDP (Commission des Données Personnelles)"]
      }
    ];

    let currentY = 62;
    features.forEach((feat) => {
      pdf.setFillColor(22, 30, 49);
      pdf.setDrawColor(245, 158, 11);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(15, currentY, 180, 52, 3, 3, "FD");

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(245, 158, 11);
      pdf.text(feat.title, 22, currentY + 10);

      pdf.setFontSize(9.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(226, 232, 240);

      let pY = currentY + 19;
      feat.points.forEach((pt) => {
        pdf.text(`✔  ${pt}`, 22, pY);
        pY += 7.5;
      });

      currentY += 60;
    });

    // CTA
    pdf.setFillColor(245, 158, 11);
    pdf.roundedRect(15, currentY + 5, 180, 30, 3, 3, "F");

    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(11, 15, 25);
    pdf.text("DEMANDEZ VOTRE DÉMONSTRATION GRATUITE", 22, currentY + 17);

    pdf.setFontSize(9.5);
    pdf.setFont("helvetica", "bold");
    pdf.text("Contactez notre équipe : +221 70 533 46 11 • contact@senauratech.sn", 22, currentY + 26);

    const cleanFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    pdf.save(cleanFileName);
    return true;
  } catch (err) {
    console.error("Error generating digital ERP affiche:", err);
    return false;
  }
}


