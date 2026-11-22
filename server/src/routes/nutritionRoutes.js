import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get recipe catalogue with filters
router.get('/recipes', authenticateToken, async (req, res) => {
  try {
    const { category, mealType, tag } = req.query;

    const where = {};
    if (category) where.category = category;
    if (mealType) where.mealType = mealType;
    if (tag) where.dietaryTags = { has: tag };

    const recipes = await prisma.recipe.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, count: recipes.length, recipes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch recipes.', error: err.message });
  }
});

// Get category-specific nutrition guidelines (recommended foods, foods to limit, educational tips)
router.get('/guidelines', authenticateToken, async (req, res) => {
  try {
    const category = req.user.category || 'NORMAL';

    const guidelineData = {
      ATHLETE: {
        headline: 'High-Performance Sports Fuel & Glycogen Optimization',
        caloriesBaseline: '2,600 - 3,200 kcal/day (adjusted for training volume)',
        recommendedFoods: [
          { name: 'Complex Carbohydrates', items: 'Oats, brown rice, sweet potatoes, whole grain pasta' },
          { name: 'Lean Protein Sources', items: 'Chicken breast, wild fish, eggs, low-fat paneer, whey isolate, tofu' },
          { name: 'Anti-Inflammatory Fats', items: 'Avocado, walnuts, chia seeds, extra-virgin olive oil' },
          { name: 'Electrolyte Hydrators', items: 'Coconut water, mineral water, citrus fruits, watermelon' }
        ],
        foodsToLimit: [
          'Ultra-processed trans fats that inhibit capillary blood flow',
          'Heavy refined sugars leading to insulin rollercoasters before training',
          'Excessive alcohol which impairs muscle protein synthesis (MPS) by up to 37%'
        ],
        disclaimer: 'General educational sports nutrition guidance. Consult a registered sports dietitian for specialized competition prep.'
      },
      SENIOR: {
        headline: 'Vitality, Bone Density & Digestive Harmony for Seniors',
        caloriesBaseline: '1,800 - 2,200 kcal/day with focus on nutrient density',
        recommendedFoods: [
          { name: 'Calcium & Bone Fortifiers', items: 'A2 cow milk, fresh curd/yogurt, ragi (finger millet), sesame seeds' },
          { name: 'Easy-to-Digest Proteins', items: 'Yellow moong dal, soft tofu, steamed egg whites, soaked sprouted legumes' },
          { name: 'Cardiovascular Protectants', items: 'Steamed leafy greens (palak, methi), garlic, flaxseed powder' },
          { name: 'Gentle Hydration', items: 'Warm cumin-infused water, tender coconut water, diluted buttermilk' }
        ],
        foodsToLimit: [
          'High-sodium packaged snacks (pickles, papads with excess salt) that elevate blood pressure',
          'Deep-fried savories (samosas, pakodas) that cause acidity and digestive sluggishness',
          'Excess refined white sugar which triggers rapid blood glucose spikes'
        ],
        disclaimer: 'General educational wellness guidelines. Please strictly adhere to dietary restrictions prescribed by your cardiologist or diabetologist.'
      },
      GYM_FREAK: {
        headline: 'Hypertrophy Macro Architecture & Nutrient Timing',
        caloriesBaseline: 'Calculated via TDEE + 300 kcal (bulking) or -400 kcal (cutting)',
        recommendedFoods: [
          { name: 'High Biological Value Protein', items: 'Whey isolate, chicken breast, egg whites, Greek yogurt, sattu, paneer' },
          { name: 'Glycogen Fuel', items: 'White basmati rice, cream of rice, bananas, honey, potatoes' },
          { name: 'Micronutrient Dense Greens', items: 'Broccoli, asparagus, baby spinach, beetroot for nitric oxide pumps' },
          { name: 'Cellular Hydration', items: '3.5 - 4.0 liters pure water with added pink Himalayan salt' }
        ],
        foodsToLimit: [
          'Liquid sugar calorie bombs (sodas, milkshakes) during cutting phases',
          'Excessive saturated fats before heavy squats which slow gastric emptying',
          'Chronic caloric deficits exceeding 600 kcal which accelerate catabolic muscle wasting'
        ],
        disclaimer: 'Based on exercise science principles. Traditional somatotypes are educational reference models rather than medical diagnoses.'
      },
      NORMAL: {
        headline: 'Sustainable Healthy Lifestyle & Energy Balance',
        caloriesBaseline: '2,000 - 2,400 kcal/day (balanced macronutrient distribution)',
        recommendedFoods: [
          { name: 'Rainbow Vegetables & Salads', items: 'Carrots, bell peppers, cucumbers, tomatoes, seasonal greens' },
          { name: 'Wholesome Legumes & Pulses', items: 'Chana dal, rajma, edamame, lentils, paneer, eggs' },
          { name: 'High-Fiber Whole Grains', items: 'Multigrain roti, oats, red rice, barley' },
          { name: 'Nutrient-Packed Seeds', items: 'Pumpkin seeds, almonds, roasted makhana' }
        ],
        foodsToLimit: [
          'Sugary carbonated beverages and sweetened teas',
          'Processed meats and hydrogenated oil bakery items',
          'Late-night heavy snacking within 2 hours of bedtime'
        ],
        disclaimer: 'Educational lifestyle nutrition. Consult a healthcare professional for specific clinical dietary therapies.'
      }
    };

    const currentGuideline = guidelineData[category] || guidelineData.NORMAL;
    res.json({ success: true, category, guidelines: currentGuideline });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch nutrition guidelines.', error: err.message });
  }
});

export default router;
