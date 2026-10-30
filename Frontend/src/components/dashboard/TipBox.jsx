import { useState } from "react";
import { getRandomTip } from "../../utils/mood";

export default function TipBox() {
  const [tip] = useState(getRandomTip);

  return (
    <aside
      className="md:self-start p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-blue-500/30 animate-float"
      aria-labelledby="tip-title"
    >
      <div className="flex items-start space-x-3">
        <span className="text-2xl animate-wiggle" aria-hidden="true">💡</span>
        <div>
          <h3 id="tip-title" className="font-bold text-blue-200 mb-2">
            Tip of the Day
          </h3>
          <p className="text-blue-100">{tip}</p>
        </div>
      </div>
    </aside>
  );
}
