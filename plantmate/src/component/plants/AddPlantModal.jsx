// src/components/plants/AddPlantModal.jsx
import React, { useEffect, useState } from "react";
import { FaRobot } from "react-icons/fa";
import api from "../../lib/api";
import {
  getUser,
  loadLocal,
  saveLocal,
  DEFAULT_PLANTS,
  localRecs,
  LS_USER_PLANTS,
} from "../../utils/plantHelpers";

function AddPlantModal({ spaces, catalog, plantsBase, onClose, onAdded }) {
  const user = getUser();
  const [spaceId, setSpaceId] = useState(spaces[0]?.id || spaces[0]?._id || "");
  const [nickname, setNickname] = useState("");
  const [plantSlug, setPlantSlug] = useState("");
  const [recs, setRecs] = useState([]);

  // fetch AI recommendations (with rule-based fallback)
  useEffect(() => {
    const run = async () => {
      if (!spaceId) {
        setRecs([]);
        return;
      }

      const sp = (spaces || []).find((s) => (s.id || s._id) === spaceId);
      const allCatalog = catalog && catalog.length > 0 ? catalog : DEFAULT_PLANTS;

      try {
        const { data } = await api.get("/api/plants/ai-suggestions", {
          params: { spaceId },
        });

        const arr = Array.isArray(data) ? data : data?.suggestions;
        if (Array.isArray(arr) && arr.length) {
          setRecs(
            arr.map((r) => ({
              plant_slug: r.plant_slug,
              common_name: r.common_name,
              scientific_name: r.scientific_name || "",
              score: r.score ?? 1,
              rationale: r.rationale || "Suggested by AI",
              plant: allCatalog.find((p) => p.slug === r.plant_slug),
            }))
          );
          return;
        }
        console.log("AI RECS:", arr); // yahan recs ki jagah arr log karo


      } catch (e) {
        // ignore and use fallback
        console.warn("AI suggestions failed, using fallback:", e?.message);
      }

      // Local fallback
      setRecs(localRecs(allCatalog, sp, 12));
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceId]);

  const allCatalog = catalog && catalog.length > 0 ? catalog : DEFAULT_PLANTS;
  const options = allCatalog;

  const submit = async (e) => {
    e.preventDefault();
    if (!user) return alert("No user found. Please login again.");
    if (!spaceId) return alert("Please select a space");
    if (!plantSlug) return alert("Please select a plant");

    const payload = {
      user_id: user._id || user.id,
      space_id: spaceId,
      plant_slug: plantSlug,
      nickname: nickname.trim(),
    };

    const optimistic = {
      id: String(Date.now()),
      user_id: payload.user_id,
      space_id: payload.space_id,
      plant_id: payload.plant_slug,
      nickname: payload.nickname,
      status: "active",
    };

    try {
      if (plantsBase) {
        const { data } = await api.post(plantsBase, payload);
        const row = data?.plant || data?.userPlant || data;
        if (row && (row.id || row._id)) {
          onAdded(row);
          return;
        }
      }
      const list = loadLocal(LS_USER_PLANTS, []);
      const next = [optimistic, ...list];
      saveLocal(LS_USER_PLANTS, next);
      onAdded(optimistic);
    } catch {
      const list = loadLocal(LS_USER_PLANTS, []);
      const next = [optimistic, ...list];
      saveLocal(LS_USER_PLANTS, next);
      onAdded(optimistic);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden my-4 sm:my-8">
        <div className="px-4 sm:px-5 py-2 sm:py-3 border-b border-gray-200 dark:border-slate-700 bg-emerald-600 text-white font-semibold text-sm sm:text-base">
          Add Plant
        </div>
        <form onSubmit={submit} className="p-4 sm:p-5 space-y-3 sm:space-y-4">
          {/* Space select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Select Space
            </label>
            <select
              className="w-full rounded-xl border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm sm:text-base"
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
            >
              {(spaces || []).map((s) => (
                <option key={s.id || s._id} value={s.id || s._id}>
                  {s.name} ({s.sunlight_hours}h sun, {s.type})
                </option>
              ))}
            </select>
          </div>

          {/* AI Recommendations */}
          {recs.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-3 sm:p-4 border border-purple-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <FaRobot className="text-purple-600 dark:text-purple-400" />
                <h3 className="text-xs sm:text-sm font-semibold text-purple-900 dark:text-purple-200">
                  🤖 AI Recommendations for This Space
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-h-64 overflow-y-auto">
                {recs.slice(0, 6).map((r) => {
                  const plant = r.plant || allCatalog.find((p) => p.slug === r.plant_slug);
                  return (
                    <div
                      key={r.plant_slug}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${r.plant_slug === plantSlug
                          ? "border-purple-500 bg-purple-100 dark:bg-purple-900/30 shadow-md"
                          : "border-purple-200 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-sm bg-white dark:bg-slate-800"
                        }`}
                      onClick={() => setPlantSlug(r.plant_slug)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-purple-900 dark:text-purple-100">
                            {r.common_name}
                          </div>
                          <div className="text-xs text-purple-700/80 dark:text-purple-300/80 italic">
                            {r.scientific_name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {Math.round(r.score)}
                          </div>
                          <div className="text-xs text-purple-600/70 dark:text-purple-400/70">Match</div>
                        </div>
                      </div>
                      <p className="text-xs text-purple-800/90 dark:text-purple-200/90 mt-1 line-clamp-2">
                        {r.rationale}
                      </p>
                      {plant && (
                        <div className="flex gap-2 mt-2 text-xs">
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 rounded text-purple-800 dark:text-purple-200">
                            {plant.difficulty || "easy"}
                          </span>
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 rounded text-purple-800 dark:text-purple-200">
                            {plant.watering_need || "med"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Manual select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Or Select Plant Manually
            </label>
            <select
              className="w-full rounded-xl border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm sm:text-base"
              value={plantSlug}
              onChange={(e) => setPlantSlug(e.target.value)}
            >
              <option value="">-- Select a plant --</option>
              {options.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.common_name} ({p.scientific_name})
                </option>
              ))}
            </select>
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">
              Nickname (optional)
            </label>
            <input
              className="w-full rounded-xl border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm sm:text-base"
              placeholder="My Basil"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm sm:text-base"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPlantModal;
