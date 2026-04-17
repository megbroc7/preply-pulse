import { CSVUploader } from "@/components/upload/csv-uploader";

export function UploadSection() {
  return (
    <section id="upload" className="py-16 px-4">
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-dm-sans)] text-center mb-8">Ready to see your data?</h2>
        <CSVUploader />
      </div>
    </section>
  );
}
