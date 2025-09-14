declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void
    getNumberOfPages: () => number
    setPage: (pageNumber: number) => void
    setFontSize: (size: number) => void
    setFont: (font: string, style?: string) => void
    text: (text: string, x: number, y: number) => void
    setLineWidth: (width: number) => void
    line: (x1: number, y1: number, x2: number, y2: number) => void
    save: (filename: string) => void
  }
  
  class jsPDF {
    constructor()
  }
  
  export = jsPDF
}

declare module 'jspdf-autotable' {
  const autoTable: any
  export = autoTable
}
