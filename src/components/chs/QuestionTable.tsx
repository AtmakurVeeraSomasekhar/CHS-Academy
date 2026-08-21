import type { QuestionTable as QT } from "@/data/questions";
import { MathContent } from "./MathContent";

export function QuestionTable({ table }: { table: QT }) {
  return (
    <div className="mt-4 max-h-[280px] overflow-auto rounded-lg border border-slate-200 shadow-sm">
      <table className="w-full border-collapse text-navy-deep">
        <thead className="sticky top-0 bg-navy-deep text-white">
          <tr>
            {table.headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-2 text-left text-xs font-black tracking-widest uppercase border-b border-gold/30"
              >
                <MathContent as="span" text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 ? "bg-slate-50" : "bg-white"}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2 border-b border-slate-200 text-sm">
                  <MathContent as="span" text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
