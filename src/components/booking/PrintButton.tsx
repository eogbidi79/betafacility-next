"use client";

import { Button } from "@/components/ui/Button";

export function PrintButton() {
  return (
    <Button variant="outline" onClick={() => window.print()} className="print:hidden">
      Print / Save PDF
    </Button>
  );
}
