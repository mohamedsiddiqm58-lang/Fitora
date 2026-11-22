import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

async function seed() {
  console.log('🌱 Starting Fitora Database Seeding...');

  // 1. Clear existing seed data if needed
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.partnerBooking.deleteMany();
  await prisma.partnerService.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.workoutLog.deleteMany();
  await prisma.exerciseLibrary.deleteMany();
  await prisma.medicineReminder.deleteMany();
  await prisma.habitLog.deleteMany();
  await prisma.habitStreak.deleteMany();
  await prisma.waterIntakeLog.deleteMany();
  await prisma.sleepLog.deleteMany();
  await prisma.wearableMeasurement.deleteMany();
  await prisma.wearableConnection.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.userHealthCondition.deleteMany();
  await prisma.userAllergy.deleteMany();
  await prisma.userMedication.deleteMany();
  await prisma.onboardingResponse.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  // 2. Subscription Plans
  const plans = [
    // Free Basic Plan
    {
      planCode: 'BASIC_FREE',
      tier: 'BASIC',
      name: 'Free Basic Tier',
      priceInr: 0,
      billingCycle: 'FREE_FOREVER',
      featuresJson: [
        'Fitness & health profile questionnaire',
        'Standard workout and exercise library',
        'Hydration, sleep and habit tracking',
        'Medicine reminders',
        'Emergency call shortcut'
      ]
    },
    // Athletes Plans
    {
      planCode: 'ATHLETE_FREEMIUM',
      category: 'ATHLETE',
      tier: 'FREEMIUM',
      name: 'Athlete Freemium',
      priceInr: 99,
      billingCycle: 'MONTHLY',
      featuresJson: [
        'All Basic features',
        'AI Fitness Companion with unlimited questions',
        'Scheduled training & recovery check-ins',
        'Personalized performance summaries'
      ]
    },
    {
      planCode: 'ATHLETE_PREMIUM',
      category: 'ATHLETE',
      tier: 'PREMIUM',
      name: 'Athlete Pro Performance',
      priceInr: 499,
      billingCycle: 'MONTHLY',
      featuresJson: [
        'All Freemium features',
        'Supplement & protein shake guides',
        'Personalized sports nutrition planning',
        'Partner product catalogue with exclusive athlete discounts',
        'Direct partner ordering & referral links'
      ]
    },
    // Senior Citizens Plans
    {
      planCode: 'SENIOR_FREEMIUM',
      category: 'SENIOR',
      tier: 'FREEMIUM',
      name: 'Senior Vitality Freemium',
      priceInr: 199,
      billingCycle: 'MONTHLY',
      featuresJson: [
        'All Basic features with Senior UI Mode',
        'AI Wellness Companion with gentle reminders',
        'Scheduled daily wellness check-ins',
        'Accessible voice-friendly interactions'
      ]
    },
    {
      planCode: 'SENIOR_PREMIUM',
      category: 'SENIOR',
      tier: 'PREMIUM',
      name: 'Senior Complete Care Package',
      priceInr: 1999,
      billingCycle: 'PACKAGE_6_MONTHS',
      featuresJson: [
        'All Freemium features',
        'Hospital partner directory access',
        'Priority doctor appointment booking assistance',
        'Dedicated caregiver notification integration',
        'Emergency priority call routing'
      ]
    },
    // Gym Freaks Plans
    {
      planCode: 'GYM_FREEMIUM',
      category: 'GYM_FREAK',
      tier: 'FREEMIUM',
      name: 'Gym Freak Freemium',
      priceInr: 149,
      billingCycle: 'MONTHLY',
      featuresJson: [
        'All Basic features',
        'AI Workout Companion for hypertrophy & progressive overload',
        'Adaptive workout suggestions based on logged RPE',
        'Macro & protein intake check-ins'
      ]
    },
    {
      planCode: 'GYM_PREMIUM',
      category: 'GYM_FREAK',
      tier: 'PREMIUM',
      name: 'Gym Freak Elite',
      priceInr: 299,
      billingCycle: 'MONTHLY',
      featuresJson: [
        'All Freemium features',
        'Partner gym directory & exclusive guest passes',
        'Certified personal trainer discovery & booking',
        'Partner supplement store promotions (up to 25% off)'
      ]
    },
    // Normal People Plans
    {
      planCode: 'NORMAL_FREEMIUM',
      category: 'NORMAL',
      tier: 'FREEMIUM',
      name: 'Healthy Lifestyle Freemium',
      priceInr: 149,
      billingCycle: 'MONTHLY',
      featuresJson: [
        'All Basic features',
        'AI Lifestyle Companion with daily encouragement',
        'Habit streak coaching & smart reminders',
        'Healthy recipe recommendations'
      ]
    },
    {
      planCode: 'NORMAL_PREMIUM',
      category: 'NORMAL',
      tier: 'PREMIUM',
      name: 'Complete Health Premium',
      priceInr: 299,
      billingCycle: 'MONTHLY',
      featuresJson: [
        'All Freemium features',
        'Personalized adaptive workout & meal plans',
        'Weekly comprehensive progress reports',
        'Goal-based lifestyle & stress management guidance'
      ]
    }
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.create({ data: plan });
  }
  console.log(`✅ Created ${plans.length} subscription plans.`);

  // 3. Exercise Library
  const exercises = [
    // Senior Friendly
    {
      name: 'Seated Knee Extensions',
      category: 'SENIOR',
      muscleGroup: 'Quadriceps & Knee Joint',
      instructions: 'Sit tall on a sturdy chair with feet flat. Slowly extend your right leg forward until straight, pause for 3 seconds while gently squeezing thigh muscles, and lower back slowly. Repeat on left leg.',
      durationSeconds: 120,
      sets: 3,
      reps: 10,
      restSeconds: 45,
      difficulty: 'Gentle',
      estimatedCalories: 30,
      mediaUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80',
      safetyNotes: 'Keep back supported against the chair. Never swing or jerk the leg rapidly.',
      modifications: 'Can be done with ankle weights as strength improves.',
      isSeniorFriendly: true
    },
    {
      name: 'Wall Push-Ups',
      category: 'SENIOR',
      muscleGroup: 'Chest, Arms & Shoulders',
      instructions: 'Stand facing a clean wall about an arm’s length away. Place palms flat against wall at chest height. Keep body straight as you bend elbows to bring chest toward wall, then push back smoothly.',
      durationSeconds: 90,
      sets: 3,
      reps: 8,
      restSeconds: 45,
      difficulty: 'Gentle',
      estimatedCalories: 35,
      mediaUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
      safetyNotes: 'Ensure shoes have good non-slip grip. Do not arch lower back.',
      modifications: 'Step closer to the wall for easier resistance.',
      isSeniorFriendly: true
    },
    {
      name: 'Supported Calf Raises',
      category: 'SENIOR',
      muscleGroup: 'Calves & Ankle Stability',
      instructions: 'Stand behind a sturdy chair, holding the backrest lightly with both hands. Slowly push through the balls of your feet to raise your heels as high as comfortable. Hold for 2 seconds, then lower gently.',
      durationSeconds: 90,
      sets: 3,
      reps: 12,
      restSeconds: 30,
      difficulty: 'Gentle',
      estimatedCalories: 25,
      mediaUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
      safetyNotes: 'Focus on balance. If feeling dizzy, sit down immediately.',
      modifications: 'Perform seated if standing balance is compromised.',
      isSeniorFriendly: true
    },
    // Athlete
    {
      name: 'Explosive Box Jumps',
      category: 'ATHLETE',
      muscleGroup: 'Legs, Glutes & Fast-Twitch Fibers',
      instructions: 'Stand facing a 24-inch plyo box. Drop into a quarter squat, swing arms back, and forcefully explode upward, landing softly with both feet simultaneously in a balanced squat on the box. Step down carefully.',
      durationSeconds: 180,
      sets: 4,
      reps: 8,
      restSeconds: 90,
      difficulty: 'Advanced',
      estimatedCalories: 110,
      mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
      safetyNotes: 'Land softly like a cat to absorb impact through glutes and quads. Never jump backward off the box.',
      modifications: 'Use a lower 16-inch platform or step-ups.',
      isSeniorFriendly: false
    },
    {
      name: 'Pro Shuttle Sprints (5-10-5)',
      category: 'ATHLETE',
      muscleGroup: 'Cardiovascular, Quads, Hamstrings & Agility',
      instructions: 'Sprint 5 yards to the right, touch the ground, pivot 180 degrees and sprint 10 yards to the left, touch the ground, then sprint 5 yards through the center line at maximum velocity.',
      durationSeconds: 240,
      sets: 5,
      reps: 1,
      restSeconds: 90,
      difficulty: 'Advanced',
      estimatedCalories: 140,
      mediaUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80',
      safetyNotes: 'Warm up hamstrings and hip flexors thoroughly before initiating sprint turns.',
      modifications: 'Reduce sprint speed to 70% for endurance conditioning.',
      isSeniorFriendly: false
    },
    // Gym Freak
    {
      name: 'Barbell Back Squat',
      category: 'GYM_FREAK',
      muscleGroup: 'Quadriceps, Glutes, Adductors & Core',
      instructions: 'Rest bar across upper traps. Unrack and take two steady steps back. Inhale into belly, brace core, push hips back and knees out until thighs are parallel to floor. Drive up explosively pushing floor away.',
      durationSeconds: 300,
      sets: 4,
      reps: 8,
      restSeconds: 120,
      difficulty: 'Intermediate',
      estimatedCalories: 130,
      mediaUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
      safetyNotes: 'Always use safety pins inside a power rack. Keep heels planted firmly.',
      modifications: 'Goblet squat or leg press if lower back needs deloading.',
      isSeniorFriendly: false
    },
    {
      name: 'Incline Dumbbell Bench Press',
      category: 'GYM_FREAK',
      muscleGroup: 'Upper Pectorals & Anterior Deltoid',
      instructions: 'Set bench to a 30-degree incline. Kick dumbbells up into pressing position with elbows at 45 degrees. Press upward in a slight arc, squeezing upper chest at peak contraction without clanking dumbbells.',
      durationSeconds: 240,
      sets: 4,
      reps: 10,
      restSeconds: 90,
      difficulty: 'Intermediate',
      estimatedCalories: 95,
      mediaUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
      safetyNotes: 'Retract scapula into bench to protect rotator cuffs.',
      modifications: 'Use neutral grip (palms facing inward) if shoulder pinch occurs.',
      isSeniorFriendly: false
    },
    // Normal People
    {
      name: 'Classic Push-Ups',
      category: 'NORMAL',
      muscleGroup: 'Chest, Triceps & Core',
      instructions: 'Start in a high plank with hands slightly wider than shoulders. Keeping core tight and body in one straight line, lower chest until elbows reach 90 degrees, then push ground away smoothly.',
      durationSeconds: 120,
      sets: 3,
      reps: 12,
      restSeconds: 60,
      difficulty: 'Beginner',
      estimatedCalories: 60,
      mediaUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80',
      safetyNotes: 'Avoid sagging hips or flaring elbows outward like a T.',
      modifications: 'Perform knee push-ups or hands-elevated on a sofa/table.',
      isSeniorFriendly: false
    },
    {
      name: 'Bodyweight Squats & Calf Pulse',
      category: 'NORMAL',
      muscleGroup: 'Legs, Hips & Mobility',
      instructions: 'Stand with feet shoulder-width apart, toes turned slightly out. Lower hips down as if sitting on an invisible chair, keeping chest upright. Press through mid-foot to stand up and finish with a gentle calf raise.',
      durationSeconds: 150,
      sets: 3,
      reps: 15,
      restSeconds: 45,
      difficulty: 'Beginner',
      estimatedCalories: 75,
      mediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
      safetyNotes: 'Keep knees tracking over toes. Do not let knees cave inward.',
      modifications: 'Squat down to a chair seat.',
      isSeniorFriendly: true
    },
    {
      name: 'Core Plank & Breathing',
      category: 'NORMAL',
      muscleGroup: 'Transverse Abdominis & Lower Back',
      instructions: 'Rest on forearms and toes with elbows directly below shoulders. Keep body rigid from crown of head to heels. Breathe deeply and smoothly without letting hips drop.',
      durationSeconds: 180,
      sets: 3,
      reps: 1,
      restSeconds: 60,
      difficulty: 'Beginner',
      estimatedCalories: 45,
      mediaUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600&auto=format&fit=crop&q=80',
      safetyNotes: 'If lower back pinches, raise hips slightly or drop to knees.',
      modifications: 'Forearm plank on knees for beginners.',
      isSeniorFriendly: true
    }
  ];

  for (const ex of exercises) {
    await prisma.exerciseLibrary.create({ data: ex });
  }
  console.log(`✅ Created ${exercises.length} exercises.`);

  // 4. Healthy Recipes
  const recipes = [
    {
      title: 'High-Protein Paneer & Spiced Quinoa Bowl',
      category: 'GYM_FREAK',
      mealType: 'Lunch',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      prepTimeMin: 20,
      calories: 520,
      proteinGrams: 34.0,
      carbsGrams: 48.0,
      fatsGrams: 18.0,
      ingredientsJson: [
        '150g Low-fat fresh paneer, cubed',
        '3/4 cup cooked organic quinoa',
        '1 cup steamed broccoli and bell peppers',
        '1 tbsp cold-pressed olive oil',
        'Cumin, turmeric, oregano, and pink salt'
      ],
      instructionsJson: [
        'Toss paneer cubes in olive oil, turmeric, and cumin.',
        'Sauté paneer in a pan until lightly golden on all sides.',
        'Warm the cooked quinoa and combine with steamed greens.',
        'Top with grilled paneer and garnish with freshly squeezed lemon juice.'
      ],
      dietaryTags: ['Vegetarian', 'High Protein', 'Gluten Free']
    },
    {
      title: 'Senior-Friendly Soothing Moong Dal & Spinach Khichdi',
      category: 'SENIOR',
      mealType: 'Dinner',
      imageUrl: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&auto=format&fit=crop&q=80',
      prepTimeMin: 25,
      calories: 360,
      proteinGrams: 14.5,
      carbsGrams: 58.0,
      fatsGrams: 7.5,
      ingredientsJson: [
        '1/2 cup yellow split moong dal, soaked 30 mins',
        '1/2 cup brown or white basmati rice',
        '1 cup finely chopped fresh baby spinach',
        '1 tsp A2 cow ghee with a pinch of hing (asafoetida) & cumin',
        '1/2 tsp crushed ginger and turmeric'
      ],
      instructionsJson: [
        'Heat 1 tsp ghee in a pressure cooker; temper with cumin and hing.',
        'Add crushed ginger, washed moong dal, rice, turmeric, and 3.5 cups water for a soft consistency.',
        'Cook on medium heat for 3-4 whistles until creamy.',
        'Stir in fresh chopped spinach while hot; let steam for 3 minutes before serving warm.'
      ],
      dietaryTags: ['Vegetarian', 'Easy Digestion', 'Heart Healthy', 'Senior Friendly']
    },
    {
      title: 'Athletic Recovery Salmon / Tofu Sweet Potato Plate',
      category: 'ATHLETE',
      mealType: 'Post-Workout',
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
      prepTimeMin: 30,
      calories: 610,
      proteinGrams: 42.0,
      carbsGrams: 64.0,
      fatsGrams: 17.0,
      ingredientsJson: [
        '180g Wild salmon fillet (or organic firm tofu)',
        '1 large roasted sweet potato with skin',
        '1 cup steamed asparagus & cherry tomatoes',
        '1 tbsp avocado oil dressing with dill and garlic'
      ],
      instructionsJson: [
        'Preheat oven to 200°C. Poke holes in sweet potato and bake for 35 minutes.',
        'Season salmon/tofu with sea salt, black pepper, and avocado oil.',
        'Pan-sear for 4-5 minutes per side until perfectly flaky and tender.',
        'Serve with split sweet potato and steamed asparagus to accelerate glycogen replenishment.'
      ],
      dietaryTags: ['High Protein', 'Rich in Omega-3', 'Anti-Inflammatory']
    },
    {
      title: 'Energizing Overnight Chia Oatmeal with Berries',
      category: 'NORMAL',
      mealType: 'Breakfast',
      imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=600&auto=format&fit=crop&q=80',
      prepTimeMin: 5,
      calories: 380,
      proteinGrams: 16.0,
      carbsGrams: 52.0,
      fatsGrams: 11.0,
      ingredientsJson: [
        '1/2 cup rolled oats',
        '1 tbsp chia seeds',
        '1 cup almond or toned milk',
        '1/2 cup fresh blueberries and strawberries',
        '1 tsp raw organic honey and cinnamon powder'
      ],
      instructionsJson: [
        'Combine rolled oats, chia seeds, and milk in a glass mason jar.',
        'Stir well, cover, and refrigerate overnight (or minimum 4 hours).',
        'In the morning, top with fresh berries, a drizzle of raw honey, and a dash of cinnamon.'
      ],
      dietaryTags: ['Vegetarian', 'Fiber Rich', 'No Added Sugar']
    }
  ];

  for (const rec of recipes) {
    await prisma.recipe.create({ data: rec });
  }
  console.log(`✅ Created ${recipes.length} healthy recipes.`);

  // 5. Partners
  const partners = [
    {
      name: 'Cult.fit Elite Fitness Centers',
      partnerType: 'GYM',
      description: 'India’s leading fitness network offering functional strength training, boxing, yoga, and guided strength circuits with certified trainers.',
      city: 'Bangalore, Mumbai, Delhi, Hyderabad',
      address: 'Branches across metro hubs',
      phone: '+91 80 4567 8900',
      email: 'partnerships@cultfit.com',
      websiteUrl: 'https://cult.fit',
      isVerified: true,
      rating: 4.9,
      discountOffer: '20% off all Annual All-Access Passes for Fitora Members'
    },
    {
      name: 'Apollo Health & Geriatric Wellness Hospital',
      partnerType: 'HOSPITAL',
      description: 'Comprehensive senior health check-ups, cardiology consultations, physiotherapy, and priority outpatient appointment booking.',
      city: 'Chennai, Bangalore, Delhi NCR',
      address: '21 Greams Lane, Thousand Lights, Chennai',
      phone: '+91 44 2829 0200',
      email: 'seniorcare@apollohospitals.com',
      websiteUrl: 'https://apollohospitals.com',
      isVerified: true,
      rating: 4.8,
      discountOffer: 'Priority Senior Outpatient Consultation & 15% discount on Preventive Health Scans'
    },
    {
      name: 'Fast&Up Active Sports & Vitality Nutrition',
      partnerType: 'NUTRITION',
      description: 'Informed-Choice certified effervescent electrolytes, plant & whey proteins, recovery BCAAs, and daily multivitamins for active lifestyles.',
      city: 'Nationwide Pan-India Delivery',
      address: 'Parel, Mumbai',
      phone: '+91 22 6789 1234',
      email: 'support@fastandup.in',
      websiteUrl: 'https://fastandup.in',
      isVerified: true,
      rating: 4.7,
      discountOffer: 'Flat ₹250 OFF on orders above ₹999 with code FITORA250'
    }
  ];

  for (const part of partners) {
    const createdPartner = await prisma.partner.create({ data: part });

    // Seed services for partner
    if (part.partnerType === 'GYM') {
      await prisma.partnerService.create({
        data: {
          partnerId: createdPartner.id,
          title: '3-Month Unlimited Multi-Center Membership',
          serviceType: 'Gym Membership',
          priceInr: 4999,
          inclusions: ['Access to all Cult centers', 'Unlimited group workouts', 'Free gym floor access', 'Body composition analysis']
        }
      });
    } else if (part.partnerType === 'HOSPITAL') {
      await prisma.partnerService.create({
        data: {
          partnerId: createdPartner.id,
          title: 'Senior Comprehensive Health & Mobility Screening',
          serviceType: 'Health Package',
          priceInr: 1799,
          inclusions: ['Physician consultation', 'ECG & Lipid Profile', 'HbA1c diabetes check', 'Joint & mobility physical assessment']
        }
      });
    } else if (part.partnerType === 'NUTRITION') {
      await prisma.partnerService.create({
        data: {
          partnerId: createdPartner.id,
          title: 'Fitora Athletic Fuel Starter Pack (Protein + Electrolytes)',
          serviceType: 'Product Pack',
          priceInr: 1899,
          inclusions: ['1kg Whey Isolate', '2x Fast&Up Reload Electrolytes Tube', 'Fitora Shaker Bottle', 'Free Express Shipping']
        }
      });
    }
  }
  console.log(`✅ Created ${partners.length} verified partners with services.`);

  // 6. Users (Admin + Demo accounts for each of the 4 modules)
  const passwordHash = await bcrypt.hash('fitora123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@fitora.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      profile: {
        create: {
          fullName: 'Fitora System Administrator',
          age: 34,
          gender: 'Not specified',
          country: 'India',
          location: 'Bangalore',
          activityLevel: 'Active',
          selectedCategory: 'NORMAL'
        }
      }
    }
  });

  // Athlete Demo User
  const athletePlan = await prisma.subscriptionPlan.findUnique({ where: { planCode: 'ATHLETE_FREEMIUM' } });
  const athleteUser = await prisma.user.create({
    data: {
      email: 'athlete@fitora.com',
      passwordHash,
      role: 'USER',
      profile: {
        create: {
          fullName: 'Vikramaditya Rathore',
          age: 24,
          gender: 'Male',
          heightCm: 182,
          weightKg: 76,
          country: 'India',
          location: 'Chandigarh',
          activityLevel: 'Very Active',
          selectedCategory: 'ATHLETE',
          emergencyPhone: '+91 98765 43210',
          emergencyName: 'Col. K.S. Rathore',
          emergencyRelation: 'Father',
          emergencyConsent: true
        }
      },
      subscriptions: {
        create: {
          planId: athletePlan.id,
          planTier: 'FREEMIUM',
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      waterIntakeLogs: {
        create: {
          date: new Date().toISOString().split('T')[0],
          amountMl: 2200,
          targetMl: 3500
        }
      },
      habitStreak: {
        create: {
          currentStreak: 12,
          longestStreak: 21,
          lastCompletedDate: new Date().toISOString().split('T')[0]
        }
      },
      wearableConnections: {
        create: {
          deviceType: 'Smartwatch',
          providerName: 'Apple Health',
          status: 'CONNECTED',
          lastSyncedAt: new Date()
        }
      }
    }
  });

  // Senior Demo User
  const seniorPlan = await prisma.subscriptionPlan.findUnique({ where: { planCode: 'SENIOR_PREMIUM' } });
  const seniorUser = await prisma.user.create({
    data: {
      email: 'senior@fitora.com',
      passwordHash,
      role: 'USER',
      profile: {
        create: {
          fullName: 'Meenakshi Sundaram',
          age: 68,
          gender: 'Female',
          heightCm: 156,
          weightKg: 62,
          country: 'India',
          location: 'Chennai',
          activityLevel: 'Light Activity',
          selectedCategory: 'SENIOR',
          seniorModeEnabled: true,
          emergencyPhone: '+91 94440 12345',
          emergencyName: 'Ramesh Sundaram (Son)',
          emergencyRelation: 'Son',
          emergencyConsent: true
        }
      },
      subscriptions: {
        create: {
          planId: seniorPlan.id,
          planTier: 'PREMIUM',
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        }
      },
      medicineReminders: {
        createMany: {
          data: [
            {
              medicineName: 'Amlodipine 5mg',
              dosage: '1 tablet once daily in the morning',
              scheduleTime: '08:30',
              instructions: 'Take with warm water after light breakfast',
              isEnabled: true,
              acknowledgedToday: true,
              lastTakenAt: new Date()
            },
            {
              medicineName: 'Metformin 500mg',
              dosage: '1 tablet twice daily with meals',
              scheduleTime: '13:00',
              instructions: 'Take immediately with lunch',
              isEnabled: true,
              acknowledgedToday: false
            },
            {
              medicineName: 'Calcium & Vit D3',
              dosage: '1 tablet daily at night',
              scheduleTime: '21:00',
              instructions: 'Take after dinner with milk',
              isEnabled: true,
              acknowledgedToday: false
            }
          ]
        }
      },
      waterIntakeLogs: {
        create: {
          date: new Date().toISOString().split('T')[0],
          amountMl: 1400,
          targetMl: 2000
        }
      },
      habitStreak: {
        create: {
          currentStreak: 18,
          longestStreak: 30,
          lastCompletedDate: new Date().toISOString().split('T')[0]
        }
      }
    }
  });

  // Gym Freak Demo User
  const gymPlan = await prisma.subscriptionPlan.findUnique({ where: { planCode: 'GYM_PREMIUM' } });
  const gymUser = await prisma.user.create({
    data: {
      email: 'gym@fitora.com',
      passwordHash,
      role: 'USER',
      profile: {
        create: {
          fullName: 'Kabir Oberoi',
          age: 26,
          gender: 'Male',
          heightCm: 178,
          weightKg: 82,
          country: 'India',
          location: 'Delhi',
          activityLevel: 'Heavy Training',
          selectedCategory: 'GYM_FREAK',
          somatotype: 'Mesomorph',
          emergencyPhone: '+91 99999 88888',
          emergencyName: 'Sanjay Oberoi (Brother)',
          emergencyRelation: 'Brother',
          emergencyConsent: true
        }
      },
      subscriptions: {
        create: {
          planId: gymPlan.id,
          planTier: 'PREMIUM',
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      waterIntakeLogs: {
        create: {
          date: new Date().toISOString().split('T')[0],
          amountMl: 3100,
          targetMl: 3800
        }
      },
      habitStreak: {
        create: {
          currentStreak: 9,
          longestStreak: 25,
          lastCompletedDate: new Date().toISOString().split('T')[0]
        }
      }
    }
  });

  // Normal Person Demo User
  const normalUser = await prisma.user.create({
    data: {
      email: 'user@fitora.com',
      passwordHash,
      role: 'USER',
      profile: {
        create: {
          fullName: 'Ananya Sharma',
          age: 29,
          gender: 'Female',
          heightCm: 165,
          weightKg: 60,
          country: 'India',
          location: 'Pune',
          activityLevel: 'Moderate',
          selectedCategory: 'NORMAL',
          emergencyPhone: '+91 98111 22334',
          emergencyName: 'Neha Sharma (Sister)',
          emergencyRelation: 'Sister',
          emergencyConsent: true
        }
      },
      waterIntakeLogs: {
        create: {
          date: new Date().toISOString().split('T')[0],
          amountMl: 1800,
          targetMl: 2500
        }
      },
      habitStreak: {
        create: {
          currentStreak: 5,
          longestStreak: 14,
          lastCompletedDate: new Date().toISOString().split('T')[0]
        }
      }
    }
  });

  console.log('✅ Demo accounts created:');
  console.log('   - Admin:      admin@fitora.com / admin123');
  console.log('   - Athlete:    athlete@fitora.com / fitora123 (Freemium)');
  console.log('   - Senior:     senior@fitora.com / fitora123 (Premium Care)');
  console.log('   - Gym Freak:  gym@fitora.com / fitora123 (Premium)');
  console.log('   - Normal:     user@fitora.com / fitora123 (Basic Free)');
  console.log('🎉 Fitora Database Seeding Complete!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
