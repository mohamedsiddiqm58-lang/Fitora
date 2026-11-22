import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Apple,
  Flame,
  CheckCircle,
  AlertCircle,
  Clock,
  BookOpen,
  Filter,
  X,
  ShieldCheck
} from 'lucide-react';

export default function NutritionPage() {
  const { user, category, seniorMode } = useAuth();
  const { showToast } = useNotification();

  const [guidelines, setGuidelines] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filterMealType, setFilterMealType] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/nutrition/guidelines'),
      api.get(`/nutrition/recipes?${filterMealType ? `mealType=${filterMealType}&` : ''}${selectedTag ? `tag=${selectedTag}&` : ''}`)
    ])
      .then(([guideRes, recipeRes]) => {
        if (guideRes.success) setGuidelines(guideRes.guidelines);
        if (recipeRes.success) setRecipes(recipeRes.recipes || []);
      })
      .catch(() => showToast('Failed to load nutrition content.', 'error'))
      .finally(() => setLoading(false));
  }, [filterMealType, selectedTag]);

  return (
    <div className={`w-full px-4 py-4 space-y-5 pb-24 ${seniorMode ? 'senior-mode' : ''}`}>
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
          Wholesome Health Nutrition
        </span>
        <h1 className="text-3xl font-black text-slate-900 mt-2 brand-font">Nutrition & Recipes</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Tailored nutritional blueprints, foods to favor or limit, and chef-curated wholesome recipes.
        </p>
      </div>

      {/* Guidelines Box */}
      {guidelines && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900 brand-font">{guidelines.headline}</h2>
              <p className="text-xs text-slate-500">Caloric Baseline: {guidelines.caloriesBaseline}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-semibold w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Evidence-Informed Principles</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recommended Foods */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Recommended Foods to Favor
              </h3>
              <div className="space-y-2">
                {guidelines.recommendedFoods?.map((food, idx) => (
                  <div key={idx} className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-xs">
                    <p className="font-bold text-emerald-950">{food.name}</p>
                    <p className="text-emerald-800 mt-0.5">{food.items}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Foods to Limit */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" /> Foods to Moderate or Limit
              </h3>
              <div className="space-y-2">
                {guidelines.foodsToLimit?.map((item, idx) => (
                  <div key={idx} className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/80 text-xs text-rose-900 font-medium">
                    • {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-100">
            {guidelines.disclaimer}
          </p>
        </div>
      )}

      {/* Recipe Catalogue Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 brand-font">Curated Healthy Recipes</h3>
          <p className="text-xs text-slate-500">Delicious nutrient-dense meals ready in 30 minutes or less</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['', 'Breakfast', 'Lunch', 'Dinner', 'Post-Workout'].map((m) => (
            <button
              key={m}
              onClick={() => setFilterMealType(m)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                filterMealType === m
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {m || 'All Meals'}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recipes.map((rec) => (
          <div
            key={rec.id}
            onClick={() => setSelectedRecipe(rec)}
            className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="h-44 overflow-hidden relative">
              {rec.imageUrl && (
                <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover" />
              )}
              <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                {rec.mealType}
              </span>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{rec.title}</h4>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {rec.dietaryTags?.map((tag, idx) => (
                    <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500" /> {rec.calories} kcal
                </span>
                <span className="flex items-center gap-1 font-bold text-emerald-700">
                  {rec.proteinGrams}g Protein
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {rec.prepTimeMin}m
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedRecipe(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
              {selectedRecipe.mealType}
            </span>
            <h3 className="text-xl font-black text-slate-900 brand-font mt-1 mb-2">{selectedRecipe.title}</h3>

            {selectedRecipe.imageUrl && (
              <img
                src={selectedRecipe.imageUrl}
                alt={selectedRecipe.title}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
            )}

            {/* Macros strip */}
            <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center mb-4">
              <div>
                <p className="text-[10px] text-slate-400">Calories</p>
                <p className="font-extrabold text-xs text-slate-900">{selectedRecipe.calories} kcal</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Protein</p>
                <p className="font-extrabold text-xs text-emerald-700">{selectedRecipe.proteinGrams}g</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Carbs</p>
                <p className="font-extrabold text-xs text-slate-900">{selectedRecipe.carbsGrams}g</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Fats</p>
                <p className="font-extrabold text-xs text-slate-900">{selectedRecipe.fatsGrams}g</p>
              </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-2 mb-4 text-xs">
              <p className="font-bold text-slate-800 uppercase tracking-wider">Ingredients</p>
              <ul className="space-y-1 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
                {Array.isArray(selectedRecipe.ingredientsJson) &&
                  selectedRecipe.ingredientsJson.map((item, idx) => (
                    <li key={idx} className="text-slate-700">• {item}</li>
                  ))}
              </ul>
            </div>

            {/* Preparation Steps */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-800 uppercase tracking-wider">Preparation Instructions</p>
              <ol className="space-y-2">
                {Array.isArray(selectedRecipe.instructionsJson) &&
                  selectedRecipe.instructionsJson.map((step, idx) => (
                    <li key={idx} className="flex gap-2 text-slate-700">
                      <span className="font-bold text-emerald-700">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
