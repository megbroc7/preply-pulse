import { CSVUploader } from "@/components/upload/csv-uploader";

export function UploadSection() {
  return (
    <section id="upload" className="relative py-20 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(330_85%_96%)_0%,_transparent_50%)]" />
      <div className="relative max-w-xl mx-auto">
        <p className="text-center text-[13px] font-medium tracking-widest uppercase text-[hsl(var(--preply-pink))] mb-3">
          Ready?
        </p>
        <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-dm-sans)] text-center mb-3">
          See your numbers
        </h2>
        <p className="text-center text-gray-400 text-sm mb-10">
          Your data stays on your device. Always.
        </p>
        <CSVUploader />
      </div>
    </section>
  );
}
