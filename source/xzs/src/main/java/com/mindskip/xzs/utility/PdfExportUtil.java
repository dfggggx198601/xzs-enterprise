package com.mindskip.xzs.utility;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;

import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class PdfExportUtil {

    private static BaseFont baseFont;

    static {
        try {
            baseFont = BaseFont.createFont("STSong-Light", "UniGB-UCS2-H", BaseFont.NOT_EMBEDDED);
        } catch (Exception e) {
            throw new RuntimeException("PDF中文字体初始化失败", e);
        }
    }

    private static Font titleFont() { return new Font(baseFont, 18, Font.BOLD, new BaseColor(33, 37, 41)); }
    private static Font subtitleFont() { return new Font(baseFont, 11, Font.NORMAL, new BaseColor(108, 117, 125)); }
    private static Font sectionFont() { return new Font(baseFont, 13, Font.BOLD, new BaseColor(33, 37, 41)); }
    private static Font headerFont() { return new Font(baseFont, 10, Font.BOLD, BaseColor.WHITE); }
    private static Font cellFont() { return new Font(baseFont, 9, Font.NORMAL, new BaseColor(33, 37, 41)); }
    private static Font infoLabelFont() { return new Font(baseFont, 10, Font.BOLD, new BaseColor(73, 80, 87)); }
    private static Font infoValueFont() { return new Font(baseFont, 10, Font.NORMAL, new BaseColor(33, 37, 41)); }
    private static Font footerFont() { return new Font(baseFont, 8, Font.ITALIC, new BaseColor(173, 181, 189)); }
    private static Font passFont() { return new Font(baseFont, 9, Font.BOLD, new BaseColor(40, 167, 69)); }
    private static Font failFont() { return new Font(baseFont, 9, Font.BOLD, new BaseColor(220, 53, 69)); }

    public static Document createDocument(OutputStream os) throws DocumentException {
        Document document = new Document(PageSize.A4, 36, 36, 50, 50);
        PdfWriter writer = PdfWriter.getInstance(document, os);
        writer.setPageEvent(new FooterPageEvent());
        document.open();
        return document;
    }

    public static void addTitle(Document doc, String title) throws DocumentException {
        Paragraph p = new Paragraph(title, titleFont());
        p.setAlignment(Element.ALIGN_CENTER);
        p.setSpacingAfter(5);
        doc.add(p);
    }

    public static void addSubtitle(Document doc, String subtitle) throws DocumentException {
        Paragraph p = new Paragraph(subtitle, subtitleFont());
        p.setAlignment(Element.ALIGN_CENTER);
        p.setSpacingAfter(15);
        doc.add(p);
    }

    public static void addSection(Document doc, String title) throws DocumentException {
        Paragraph p = new Paragraph(title, sectionFont());
        p.setSpacingBefore(15);
        p.setSpacingAfter(8);
        doc.add(p);
        // 分隔线
        PdfPTable line = new PdfPTable(1);
        line.setWidthPercentage(100);
        PdfPCell lineCell = new PdfPCell();
        lineCell.setBorderWidth(0);
        lineCell.setBorderWidthBottom(1.5f);
        lineCell.setBorderColorBottom(new BaseColor(0, 123, 255));
        lineCell.setFixedHeight(2);
        line.addCell(lineCell);
        doc.add(line);
    }

    public static void addInfoTable(Document doc, List<String[]> infoItems) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.2f, 2f, 1.2f, 2f});
        table.setSpacingBefore(8);
        table.setSpacingAfter(10);

        BaseColor bgColor = new BaseColor(248, 249, 250);
        for (int i = 0; i < infoItems.size(); i++) {
            String[] item = infoItems.get(i);
            PdfPCell labelCell = new PdfPCell(new Phrase(item[0], infoLabelFont()));
            labelCell.setBorderWidth(0.5f);
            labelCell.setBorderColor(new BaseColor(222, 226, 230));
            labelCell.setBackgroundColor(bgColor);
            labelCell.setPadding(6);
            labelCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            table.addCell(labelCell);

            PdfPCell valueCell = new PdfPCell(new Phrase(item[1], infoValueFont()));
            valueCell.setBorderWidth(0.5f);
            valueCell.setBorderColor(new BaseColor(222, 226, 230));
            valueCell.setPadding(6);
            valueCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            table.addCell(valueCell);

            if (item.length >= 4) {
                PdfPCell labelCell2 = new PdfPCell(new Phrase(item[2], infoLabelFont()));
                labelCell2.setBorderWidth(0.5f);
                labelCell2.setBorderColor(new BaseColor(222, 226, 230));
                labelCell2.setBackgroundColor(bgColor);
                labelCell2.setPadding(6);
                labelCell2.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(labelCell2);

                PdfPCell valueCell2 = new PdfPCell(new Phrase(item[3], infoValueFont()));
                valueCell2.setBorderWidth(0.5f);
                valueCell2.setBorderColor(new BaseColor(222, 226, 230));
                valueCell2.setPadding(6);
                valueCell2.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(valueCell2);
            } else {
                // 占满剩余两列
                PdfPCell emptyCell = new PdfPCell(new Phrase("", cellFont()));
                emptyCell.setBorderWidth(0.5f);
                emptyCell.setBorderColor(new BaseColor(222, 226, 230));
                emptyCell.setColspan(2);
                emptyCell.setPadding(6);
                table.addCell(emptyCell);
            }
        }
        doc.add(table);
    }

    public static void addStatsBar(Document doc, String[] labels, String[] values) throws DocumentException {
        PdfPTable table = new PdfPTable(labels.length);
        table.setWidthPercentage(100);
        table.setSpacingBefore(8);
        table.setSpacingAfter(10);

        BaseColor[] colors = {
            new BaseColor(0, 123, 255), new BaseColor(40, 167, 69),
            new BaseColor(255, 193, 7), new BaseColor(220, 53, 69),
            new BaseColor(23, 162, 184), new BaseColor(108, 117, 125)
        };

        for (int i = 0; i < labels.length; i++) {
            BaseColor color = colors[i % colors.length];
            PdfPCell cell = new PdfPCell();
            cell.setBorderWidth(0);
            cell.setBackgroundColor(color);
            cell.setPadding(10);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);

            Paragraph val = new Paragraph(values[i], new Font(baseFont, 16, Font.BOLD, BaseColor.WHITE));
            val.setAlignment(Element.ALIGN_CENTER);
            cell.addElement(val);

            Paragraph label = new Paragraph(labels[i], new Font(baseFont, 8, Font.NORMAL, new BaseColor(255, 255, 255, 200)));
            label.setAlignment(Element.ALIGN_CENTER);
            cell.addElement(label);

            table.addCell(cell);
        }
        doc.add(table);
    }

    public static void addDataTable(Document doc, String[] headers, float[] widths, List<String[]> rows, int scoreColIndex, String passScore) throws DocumentException {
        PdfPTable table = new PdfPTable(headers.length);
        table.setWidthPercentage(100);
        table.setWidths(widths);
        table.setSpacingBefore(5);

        BaseColor headerBg = new BaseColor(52, 58, 64);
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headerFont()));
            cell.setBackgroundColor(headerBg);
            cell.setPadding(7);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setBorderWidth(0);
            table.addCell(cell);
        }

        BaseColor evenBg = new BaseColor(248, 249, 250);
        double passScoreVal = -1;
        try { if (passScore != null) passScoreVal = Double.parseDouble(passScore); } catch (Exception ignored) {}

        for (int i = 0; i < rows.size(); i++) {
            String[] row = rows.get(i);
            BaseColor rowBg = (i % 2 == 0) ? BaseColor.WHITE : evenBg;
            for (int j = 0; j < row.length; j++) {
                Font font = cellFont();
                if (j == scoreColIndex && passScoreVal >= 0) {
                    try {
                        double score = Double.parseDouble(row[j]);
                        font = score >= passScoreVal ? passFont() : failFont();
                    } catch (Exception ignored) {}
                }
                PdfPCell cell = new PdfPCell(new Phrase(row[j] != null ? row[j] : "", font));
                cell.setBackgroundColor(rowBg);
                cell.setPadding(6);
                cell.setHorizontalAlignment(j == 0 ? Element.ALIGN_CENTER : Element.ALIGN_LEFT);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setBorderWidth(0.5f);
                cell.setBorderColor(new BaseColor(222, 226, 230));
                table.addCell(cell);
            }
        }
        doc.add(table);
    }

    public static String now() {
        return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
    }

    public static String formatDate(Date date) {
        if (date == null) return "";
        return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(date);
    }

    public static String formatDateShort(Date date) {
        if (date == null) return "";
        return new SimpleDateFormat("yyyy-MM-dd").format(date);
    }

    static class FooterPageEvent extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            Phrase footer = new Phrase("第 " + writer.getPageNumber() + " 页  |  导出时间：" +
                    new SimpleDateFormat("yyyy-MM-dd HH:mm").format(new Date()) + "  |  培训考试系统", footerFont());
            ColumnText.showTextAligned(cb, Element.ALIGN_CENTER, footer,
                    (document.right() - document.left()) / 2 + document.leftMargin(),
                    document.bottom() - 20, 0);
        }
    }
}
