import express from 'express';
import puppeteer from 'puppeteer';

const router = express.Router();

// נתיב API להמרת HTML ל-PDF
router.post('/generate-pdf', async (req, res) => {
  const { html } = req.body;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({ format: 'A4' });

  await browser.close();

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename=Report.pdf'
  });

  res.send(pdf);
});

export default router;
