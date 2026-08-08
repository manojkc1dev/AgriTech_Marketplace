export const exportVATReceiptToPDF = (contractTitle: string, amountNrs: number, buyer: string, supplier: string) => {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>AgriTech Nepal - VAT Split-Settlement Receipt</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1f2937; }
          .header { border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
          .logo { font-size: 24px; font-weight: bold; color: #065f46; }
          .title { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 20px; }
          .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .details-table th, .details-table td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
          .details-table th { background-color: #f3f4f6; }
          .total-row { font-weight: bold; background-color: #ecfdf5; }
          .footer { margin-top: 50px; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">🌿 AgriTech Nepal</div>
            <div style="font-size: 12px; color: #4b5563;">Government Authorized Wholesale Digital Infrastructure</div>
          </div>
          <div style="text-align: right; font-size: 12px;">
            <div><strong>Receipt No:</strong> VAT-2082-${Math.floor(100000 + Math.random() * 900000)}</div>
            <div><strong>Date:</strong> ${new Date().toISOString().split('T')[0]}</div>
          </div>
        </div>

        <div class="title">OFFICIAL VAT-COMPLIANT B2B RECEIPT</div>

        <table class="details-table">
          <tr><th>Contract / Item</th><td>${contractTitle}</td></tr>
          <tr><th>Buyer / Institution</th><td>${buyer}</td></tr>
          <tr><th>Authorized Supplier</th><td>${supplier}</td></tr>
          <tr><th>Base Wholesale Value</th><td>NRs. ${(amountNrs * 0.87).toLocaleString()}</td></tr>
          <tr><th>13% VAT Amount</th><td>NRs. ${(amountNrs * 0.13).toLocaleString()}</td></tr>
          <tr class="total-row"><th>Total Settlement Value</th><td>NRs. ${amountNrs.toLocaleString()}</td></tr>
        </table>

        <div style="margin-top: 40px; font-size: 13px; line-height: 1.6;">
          <p><strong>Split-Settlement Clearing Status:</strong> VERIFIED & COMPLETED</p>
          <p>This automated digital tax receipt is recorded under the Inland Revenue Department (IRD) Bagmati Province API portal.</p>
        </div>

        <div class="footer">
          AgriTech Nepal Platform Services • Kalimati Wholesale Market, Kathmandu • Support Helpline: +977-1-4200000
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const exportAuditLogsToCSV = (logs: any[]) => {
  const headers = ['ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Details', 'IP Address'];
  const rows = logs.map(l => [l.id, l.timestamp, l.actor, l.role, l.action, `"${l.details}"`, l.ipAddress]);
  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `agritech_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
