#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
═══════════════════════════════════════════════════════════════════════════════
Master Gas (ماستر غاز) - Catalog Seeder
إنشاء 10 أقسام و 30 منتجاً مع توليد صور احترافية ورفعها عبر API المشرف
═══════════════════════════════════════════════════════════════════════════════
"""

import os
import sys
import json
import time
import requests
from PIL import Image, ImageDraw, ImageFont
import arabic_reshaper
from bidi.algorithm import get_display

API_BASE = "https://backend-mastergas.be-kite.com/api"
LOGIN_EMAIL = "admin@tijara.com"
LOGIN_PASS = "password123"
IMAGE_DIR = "/tmp/mastergas_catalog"

os.makedirs(IMAGE_DIR, exist_ok=True)

FONT_PATH = "/Library/Fonts/Arial Unicode.ttf"
if not os.path.exists(FONT_PATH):
    FONT_PATH = "/System/Library/Fonts/Supplemental/Arial.ttf"

def reshape_ar(text):
    if not text:
        return ""
    try:
        reshaped = arabic_reshaper.reshape(text)
        return get_display(reshaped)
    except Exception:
        return text

def draw_badge(draw, xy, text, font, fill_color, text_color):
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    pad_x, pad_y = 16, 8
    x1, y1 = xy
    x2 = x1 + w + pad_x * 2
    y2 = y1 + h + pad_y * 2
    draw.rounded_rectangle([x1, y1, x2, y2], radius=8, fill=fill_color)
    draw.text((x1 + pad_x, y1 + pad_y - 2), text, font=font, fill=text_color)
    return x2, y2

def create_card_image(filename, title_ar, title_en, subtitle_ar, tag_text, price_text=None, is_category=False):
    width, height = 800, 800
    img = Image.new("RGB", (width, height), color=(15, 23, 42)) # Slate 900
    draw = ImageDraw.Draw(img)

    # Gradients & background accents
    accent_color = (135, 50, 96) if not is_category else (249, 115, 22) # Burgundy or Flame Orange
    for i in range(height):
        ratio = i / height
        r = int(15 * (1 - ratio) + 30 * ratio + (accent_color[0] * 0.15 * ratio))
        g = int(23 * (1 - ratio) + 41 * ratio + (accent_color[1] * 0.15 * ratio))
        b = int(42 * (1 - ratio) + 59 * ratio + (accent_color[2] * 0.15 * ratio))
        draw.line([(0, i), (width, i)], fill=(r, g, b))

    # Outer border
    draw.rounded_rectangle([20, 20, width - 20, height - 20], radius=24, outline=(71, 85, 105), width=3)
    draw.rounded_rectangle([24, 24, width - 24, height - 24], radius=20, outline=(135, 50, 96), width=2)

    # Top Brand Header
    font_brand = ImageFont.truetype(FONT_PATH, 28)
    draw.text((50, 48), "MASTER GAS  •  JORDAN", font=font_brand, fill=(203, 213, 225))
    brand_ar = reshape_ar("ماستر غاز - حلول الغاز والسلامة")
    draw.text((width - 450, 48), brand_ar, font=font_brand, fill=(249, 115, 22))

    # Header Divider
    draw.line([(50, 95), (width - 50, 95)], fill=(71, 85, 105), width=2)

    # Center Hero Graphic Box
    draw.rounded_rectangle([50, 125, width - 50, 520], radius=20, fill=(30, 41, 59), outline=(100, 116, 139), width=2)
    
    # Decorative Gas Icon Graphic
    cx, cy = width // 2, 280
    # Outer ring
    draw.ellipse([cx - 110, cy - 110, cx + 110, cy + 110], outline=accent_color, width=6)
    draw.ellipse([cx - 95, cy - 95, cx + 95, cy + 95], fill=(51, 65, 85))
    
    # Inner Flame / Cylinder Symbol
    draw.polygon([(cx, cy - 65), (cx + 45, cy + 25), (cx + 25, cy + 60), (cx - 25, cy + 60), (cx - 45, cy + 25)], fill=(249, 115, 22))
    draw.polygon([(cx, cy - 35), (cx + 25, cy + 25), (cx + 12, cy + 48), (cx - 12, cy + 48), (cx - 25, cy + 25)], fill=(254, 215, 170))

    # Center Tag Badge
    font_tag = ImageFont.truetype(FONT_PATH, 22)
    draw_badge(draw, (cx - 120, 425), reshape_ar(tag_text), font_tag, (135, 50, 96), (255, 255, 255))

    # Title Section
    font_title_ar = ImageFont.truetype(FONT_PATH, 34)
    font_title_en = ImageFont.truetype(FONT_PATH, 24)
    font_sub = ImageFont.truetype(FONT_PATH, 20)

    reshaped_title = reshape_ar(title_ar)
    bbox_ar = draw.textbbox((0, 0), reshaped_title, font=font_title_ar)
    w_ar = bbox_ar[2] - bbox_ar[0]
    draw.text(((width - w_ar) // 2, 545), reshaped_title, font=font_title_ar, fill=(255, 255, 255))

    bbox_en = draw.textbbox((0, 0), title_en, font=font_title_en)
    w_en = bbox_en[2] - bbox_en[0]
    draw.text(((width - w_en) // 2, 595), title_en, font=font_title_en, fill=(148, 163, 184))

    reshaped_sub = reshape_ar(subtitle_ar)
    bbox_sub = draw.textbbox((0, 0), reshaped_sub, font=font_sub)
    w_sub = bbox_sub[2] - bbox_sub[0]
    draw.text(((width - w_sub) // 2, 635), reshaped_sub, font=font_sub, fill=(203, 213, 225))

    # Bottom Footer Box
    draw.line([(50, 680), (width - 50, 680)], fill=(71, 85, 105), width=2)
    
    font_footer = ImageFont.truetype(FONT_PATH, 26)
    if price_text:
        price_ar = reshape_ar(f"السعر: {price_text}")
        draw.text((60, 715), price_ar, font=font_footer, fill=(52, 211, 153))
    else:
        cat_badge = reshape_ar("قسم معتمد في المتجر")
        draw.text((60, 715), cat_badge, font=font_footer, fill=(251, 191, 36))

    cert_text = reshape_ar("مطابق للمواصفات والمقاييس الأردنية JQM")
    draw.text((width - 480, 718), cert_text, font=ImageFont.truetype(FONT_PATH, 19), fill=(148, 163, 184))

    path = os.path.join(IMAGE_DIR, filename)
    img.save(path, quality=95)
    return path

# ─────────────────────────────────────────────────────────────────────────────
# 10 Categories & 30 Products Definition
# ─────────────────────────────────────────────────────────────────────────────

CATALOG = [
    {
        "name_ar": "أسطوانات الغاز ومستلزماتها",
        "name_en": "Gas Cylinders & Tanks",
        "desc_ar": "أسطوانات غاز منزلية وتجارية بمختلف الأحجام والأنواع حديد وفايبر مركبة ومطابقة لمعايير السلامة العامة.",
        "desc_en": "Domestic and commercial LPG gas cylinders in steel and composite fiber materials complying with Jordanian standards.",
        "tag": "أسطوانات معتمدة",
        "products": [
            {
                "name_ar": "أسطوانة غاز منزلية حديد 12.5 كغ",
                "name_en": "Domestic Steel LPG Cylinder 12.5kg",
                "price": 18.00,
                "quantity": 85,
                "desc_ar": "أسطوانة غاز منزلية قياسية معبأة سعة 12.5 كغ ومفحوصة صمام الأمان بدقة عالية وفق المعايير الأردنية.",
                "desc_en": "Standard 12.5kg domestic steel gas cylinder with precision safety valve, fully inspected and certified.",
                "features_ar": "هيكل فولاذي سميك مقاوم للصدأ، صمام أمان مزدوج مانع للتسريب، فحص ضغط هيدروستاتيكي دوري.",
                "features_en": "Heavy-duty rust-resistant steel body, dual safety seal valve, hydrostatically pressure tested.",
                "tips_ar": "احفظ الأسطوانة دائماً في وضع عمودي في مكان جيد التهوية بعيداً عن أشعة الشمس المباشرة.",
                "tips_en": "Always keep the cylinder upright in a well-ventilated area away from direct sunlight.",
                "tag": "سعة 12.5 كغ",
            },
            {
                "name_ar": "أسطوانة غاز فايبر مركبة خفيفة 10 كغ",
                "name_en": "Composite Fiber Gas Cylinder 10kg",
                "price": 45.00,
                "quantity": 40,
                "desc_ar": "أسطوانة فايبر عصرية خفيفة الوزن ومقاومة للانفجار وشفافة تمكّنك من رؤية مستوى الغاز المتبقي بوضوح.",
                "desc_en": "Modern lightweight composite fiber gas cylinder, 100% explosion-proof with visible translucent fuel level.",
                "features_ar": "وزن خفيف نصف وزن الحديد، غير قابلة للصدأ أو التآكل، مقاومة تامة للانفجار حتى في درجات الحرارة العالية.",
                "features_en": "Ultralight weight (50% lighter than steel), non-corrosive, non-explosive under high temperatures.",
                "tips_ar": "مثالية للاستخدام المنزلي والرحلات وسهلة الحمل لكبار السن.",
                "tips_en": "Ideal for household and outdoor use, very easy to carry for all family members.",
                "tag": "فايبر ضد الانفجار",
            },
            {
                "name_ar": "أسطوانة غاز تجارية للمطاعم 48 كغ",
                "name_en": "Commercial Steel Gas Cylinder 48kg",
                "price": 75.00,
                "quantity": 25,
                "desc_ar": "أسطوانة غاز تجارية بسعة كبيرة مخصصة للمطاعم والمطابخ المركزية والمنشآت مع تدفق غاز مستقر وعالي.",
                "desc_en": "High-capacity 48kg commercial steel gas cylinder engineered for restaurants, hotels, and central kitchens.",
                "features_ar": "سعة تخزينية ضخمة، معدل تدفق بخاري مرتفع للأفران والشوايات الصناعية، صمام أمان مقوى.",
                "features_en": "Huge storage capacity, high vapor flow rate for industrial ovens and grills, heavy-duty valve.",
                "tips_ar": "يجب تركيبها خارج المطبخ في غرفة أسطوانات مخصصة مع شبكة توصيل نحاسية مؤرضة.",
                "tips_en": "Must be installed outdoors in a dedicated cylinder cabinet with grounded brass piping.",
                "tag": "سعة تجارية 48 كغ",
            },
        ],
    },
    {
        "name_ar": "منظمات ومحابس الغاز",
        "name_en": "Gas Regulators & Valves",
        "desc_ar": "منظمات ضغط عالي ومنخفض ومحابس أمان أوتوماتيكية أصلية إيطالية ودولية معتمدة مع مقاييس ضغط دقيقة.",
        "desc_en": "Certified Italian and international high/low pressure gas regulators and automatic emergency safety valves.",
        "tag": "أمان وإحكام إيطالي",
        "products": [
            {
                "name_ar": "منظم غاز منزلي إيطالي 30 ملي بار",
                "name_en": "Italian Low-Pressure Gas Regulator 30mbar",
                "price": 9.50,
                "quantity": 120,
                "desc_ar": "منظم غاز منزلي أصلي صناعة إيطالية يوفر ضغطاً ثابتاً 30 ملي بار لضمان تشغيل آمن واقتصادي للمدافئ والطباخات.",
                "desc_en": "Genuine Italian low-pressure 30mbar domestic regulator providing stable gas flow for cookers and heaters.",
                "features_ar": "صناعة إيطالية أصلية 100%، صمام إغلاق داخلي عند تمزق الخرطوم، توفير حتى 20% في استهلاك الغاز.",
                "features_en": "100% Genuine Italian manufacture, built-in excess flow shutoff, saves up to 20% gas consumption.",
                "tips_ar": "قم بفحص جلدة المنظم المطاطية عند كل تبديل لأسطوانة الغاز للتأكد من سلامتها.",
                "tips_en": "Inspect the rubber gasket whenever replacing the gas cylinder to ensure a tight seal.",
                "tag": "إيطالي 30 ملي بار",
            },
            {
                "name_ar": "منظم غاز ضغط عالي قابل للتعديل",
                "name_en": "Adjustable High-Pressure Gas Regulator",
                "price": 14.00,
                "quantity": 60,
                "desc_ar": "منظم ضغط عالي من 0 إلى 2 بار مزود بقرص معايرة دقيق للشوايات الخارجية والقلايات الكبيرة ومواقد الصاج.",
                "desc_en": "Adjustable high-pressure regulator (0-2 bar) with manual dial control for heavy outdoor burners and grills.",
                "features_ar": "هيكل من سبائك الزنك المقوى، تدفق غاز قوي قابل للتحكم الدقيق، وصلات قياسية محكمة.",
                "features_en": "Reinforced zinc alloy casing, adjustable heavy flame flow, precision threaded connectors.",
                "tips_ar": "غير مخصص للاستخدام مع المدافئ المنزلية العادية، يستخدم فقط مع الأجهزة ذات الضغط العالي.",
                "tips_en": "Do not use with domestic space heaters; only intended for high-pressure outdoor equipment.",
                "tag": "ضغط عالي 0-2 بار",
            },
            {
                "name_ar": "محبس أمان أوتوماتيكي مع مقياس ضغط",
                "name_en": "Automatic Safety Valve with Pressure Gauge",
                "price": 12.50,
                "quantity": 55,
                "desc_ar": "صمام أمان ذكي يغلق إمداد الغاز فورياً عند حدوث تسريب في الخرطوم ومزود بساعة قياس لمراقبة مستوى الغاز.",
                "desc_en": "Smart safety valve with automatic instant leak shutoff and built-in analog pressure level gauge.",
                "features_ar": "إغلاق كلي فوري في حال انقطاع الخرطوم، عداد ميكانيكي ملون يوضح ضغط الغاز ومستوى الامتلاء، حماية مؤكدة.",
                "features_en": "Instant full shut-off on hose rupture, color-coded level gauge for cylinder content, total safety.",
                "tips_ar": "اضغط على زر إعادة التعيين (Reset) الأخضر عند أول تشغيل لفتح مجرى الغاز.",
                "tips_en": "Press the green reset button upon first connection to prime and open the gas conduit.",
                "tag": "إنذار وغلق فوري",
            },
        ],
    },
    {
        "name_ar": "صوبات ومدافئ الغاز",
        "name_en": "Gas Heaters & Stoves",
        "desc_ar": "مدافئ وصوبات غاز موفرة للطاقة ومزودة بأنظمة أمان متطورة وحساسات انخفاض الأكسجين (ODS) وحماية السقوط.",
        "desc_en": "Energy-efficient domestic LPG space heaters equipped with ODS oxygen depletion sensors and anti-tilt safety.",
        "tag": "تدفئة آمنة وذكية",
        "products": [
            {
                "name_ar": "صوبة غاز سيراميك 3 شعلات توربو",
                "name_en": "Ceramic 3-Burner Turbo Gas Heater",
                "price": 55.00,
                "quantity": 30,
                "desc_ar": "مدفأة غاز سيراميكية ذات 3 مستويات تسخين مع إشعال بيزو كهربائي وحساس أمان ODS يطفئ المدفأة عند نقص الأكسجين.",
                "desc_en": "Ceramic 3-panel gas heater with piezo ignition and built-in ODS oxygen depletion safety cutoff.",
                "features_ar": "3 ألواح سيراميك عالية الإشعاع الحراري، مفتاح أمان ضد الانقلاب، عجلات متينة لحرية الحركة 360 درجة.",
                "features_en": "3 high-radiance ceramic plaques, anti-tilt cutoff switch, sturdy 360-degree rolling caster wheels.",
                "tips_ar": "تأكد من وجود تهوية طبيعية متجددة في الغرفة أثناء تشغيل المدفأة.",
                "tips_en": "Ensure proper room ventilation is maintained at all times while the heater is active.",
                "tag": "3 شعلات سيراميك",
            },
            {
                "name_ar": "مدفأة غاز وديكور حديثة بنظام أمان",
                "name_en": "Modern Decorative Gas Heater with Safety ODS",
                "price": 85.00,
                "quantity": 18,
                "desc_ar": "مدفأة غاز عصرية ذات واجهة زجاجية حرارية بتصميم أنيق يناسب غرف المعيشة مع شعلة لهب زرقاء دافئة ونظيفة.",
                "desc_en": "Contemporary glass-front decorative gas heater producing clean blue flame warmth for stylish living spaces.",
                "features_ar": "واجهة زجاج مقسى حرارياً، احتراق كامل بنسبة 99.8% دون رائحة، ثرموستات للتحكم بالحرارة.",
                "features_en": "Tempered glass fascia, 99.8% complete odorless combustion, adjustable thermal thermostat.",
                "tips_ar": "قم بإجراء صيانة سنوية وتنظيف فتحات التهوية الداخلية قبل بداية كل موسم شتاء.",
                "tips_en": "Schedule annual maintenance and clean internal air intakes before every winter season.",
                "tag": "تصميم ديكوري فاخر",
            },
            {
                "name_ar": "صوبة غاز بالأشعة تحت الحمراء مع مروحة",
                "name_en": "Infrared Gas Space Heater with Electric Fan",
                "price": 68.00,
                "quantity": 22,
                "desc_ar": "مدفأة غاز هجينة تجمع بين حرارة السيراميك ومروحة توزيع الهواء الكهربائية لنشر الدفء في كافة أرجاء الغرفة بسرعة.",
                "desc_en": "Hybrid infrared gas heater featuring an electric blower fan to rapidly circulate warm air throughout the room.",
                "features_ar": "تدفئة سريعة مضاعفة، مروحة توزيع هواء هادئة، مساحة خلفية مدمجة تستوعب أسطوانة 12.5 كغ.",
                "features_en": "Accelerated double warmth, whisper-quiet blower fan, internal cabinet holding standard 12.5kg cylinder.",
                "tips_ar": "يمكن تشغيل خيار الغاز بمفرده أو مع المروحة الكهربائية حسب الرغبة.",
                "tips_en": "Can be operated on gas only or with the electric fan activated for accelerated heating.",
                "tag": "مروحة توزيع حراري",
            },
        ],
    },
    {
        "name_ar": "معدات غاز التخييم والرحلات",
        "name_en": "Camping & Outdoor Gas Gear",
        "desc_ar": "مواقد وأسطوانات وفوانيس غاز خفيفة الوزن ومحمولة مخصصة لعشاق رحلات البر والتخييم والأنشطة الخارجية.",
        "desc_en": "Portable lightweight gas stoves, safari cartridges, and outdoor lanterns designed for camping and adventure.",
        "tag": "رحلات وتخييم",
        "products": [
            {
                "name_ar": "موقد رحلات غاز متنقل مع حقيبة واقية",
                "name_en": "Portable Outdoor Camping Gas Stove",
                "price": 15.00,
                "quantity": 70,
                "desc_ar": "موقد غاز سفري خفيف الوزن يعمل بعبوات الغاز الصغيرة مع نظام إشعال ذاتي وحقيبة بلاستيكية متينة لحفظه ونقله.",
                "desc_en": "Lightweight portable single-burner camping gas stove with automatic piezo starter and rigid carry case.",
                "features_ar": "إشعال ذاتي كهرضغطي بدون كبريت، مصدات مدمجة للرياح، صمام إغلاق أمان عند ارتفاع الضغط.",
                "features_en": "Piezo ignition, built-in wind deflectors, overpressure cartridge ejection safety system.",
                "tips_ar": "احرص على تثبيت عبوة الغاز في المجرى المخصص والتأكد من قفل ذراع التثبيت قبل الإشعال.",
                "tips_en": "Ensure the cartridge notch is aligned with the safety lever locked before igniting.",
                "tag": "موقد سفري بحقيبة",
            },
            {
                "name_ar": "عبوات أسطوانة غاز سفاري 220 غرام (طقم 4)",
                "name_en": "Camping Gas Cartridge 220g 4-Pack",
                "price": 5.00,
                "quantity": 150,
                "desc_ar": "مجموعة من 4 عبوات غاز بوتان مدمجة ونقية سعة 220 غرام للمواقد المحمولة وفوانيس التخييم ومسدسات اللهب.",
                "desc_en": "Pack of 4 high-purity 220g butane gas canisters compatible with portable stoves, lanterns, and torches.",
                "features_ar": "غاز بوتان مصفى عالي الاشتعال، صمام أمان ذاتي الإحكام عند الفك، وقت تشغيل حتى ساعتين ونصف لكل عبوة.",
                "features_en": "Refined butane blend, self-sealing valve on detachment, up to 2.5 hours runtime per cartridge.",
                "tips_ar": "لا تعرض العبوات لحرارة تزيد عن 50 درجة مئوية ولا تتركها داخل السيارة المغلقة صيفاً.",
                "tips_en": "Do not expose canisters to temperatures above 50°C or leave inside parked cars under sunlight.",
                "tag": "طقم 4 عبوات غاز",
            },
            {
                "name_ar": "فانوس غاز للتخييم مع إشعال ذاتي",
                "name_en": "Outdoor Gas Lantern with Piezo Ignition",
                "price": 16.50,
                "quantity": 45,
                "desc_ar": "فانوس إضاءة غازي للرحلات يمنح ضوءاً أبيض دافئاً مع شبكة حماية زجاجية وسلسلة للتعليق في الخيام.",
                "desc_en": "Outdoor gas camping lantern providing powerful 360-degree warm illumination with frosted glass globe.",
                "features_ar": "قوة إضاءة تعادل 80 واط، استهلاك غاز اقتصادي جداً (40غ/ساعة)، سلسلة تعليق ستانلس ومقبض متين.",
                "features_en": "80W equivalent luminous output, ultra-low consumption (40g/h), stainless hanging chain.",
                "tips_ar": "استخدم شبكة الفتيل (Mantle) المرفقة وقم بحرقها مبدئياً للحصول على أقصى سطوع.",
                "tips_en": "Pre-burn the included mantle as instructed to maximize brightness and longevity.",
                "tag": "إضاءة تخييم قوية",
            },
        ],
    },
    {
        "name_ar": "خراطيم وتوصيلات الغاز الآمنة",
        "name_en": "Gas Hoses & Connectors",
        "desc_ar": "خراطيم ضغط عالي مدرعة معززة بالفولاذ ومقاومة للتآكل ووصلات نحاسية مانعة للتسريب معتمدة للسلامة.",
        "desc_en": "Armored high-pressure gas hoses reinforced with steel mesh and certified leak-proof brass fittings.",
        "tag": "خراطيم مدرعة ضد التمزق",
        "products": [
            {
                "name_ar": "خرطوم غاز ألماني مدرع 2 متر مع مرابط",
                "name_en": "German Reinforced Gas Hose 2m with Clamps",
                "price": 7.50,
                "quantity": 90,
                "desc_ar": "خرطوم غاز ثلاثي الطبقات معزز بنسيج شبكي ألماني مقاوم للضغط العالي والحرارة ومرفق بمرابط ربط ستانلس ستيل.",
                "desc_en": "3-layer reinforced German standard gas hose with inner steel braiding, includes heavy-duty stainless clamps.",
                "features_ar": "مقاومة ضغط حتى 20 بار، طبقة خارجية مقاومة للقوارض والاهتراء، مرونة عالية في درجات الحرارة الباردة.",
                "features_en": "Burst-tested to 20 bar, rodent-resistant tough outer jacket, retains full flexibility in cold weather.",
                "tips_ar": "يُنصح باستبدال خراطيم الغاز كل عامين حفاظاً على السلامة العامة والوقاية من التشققات.",
                "tips_en": "Replace gas hoses every two years to maintain safety and prevent microscopic cracking.",
                "tag": "ألماني مدرع 2 متر",
            },
            {
                "name_ar": "خرطوم غاز مرن ستانلس ستيل 1.5 متر",
                "name_en": "Flexible Stainless Steel Gas Hose 1.5m",
                "price": 11.00,
                "quantity": 65,
                "desc_ar": "خرطوم غاز مرن مصفح بالفولاذ المقاوم للصدأ بالكامل مع وصلات ملولبة نحاسية مثالي للطباخات والسخانات.",
                "desc_en": "Full stainless steel braided flexible gas hose 1.5m with threaded brass union nuts for ovens and geysers.",
                "features_ar": "مقاومة تامة للهب المباشر، لا يتأثر بالحرارة المحيطة خلف الأفران، عمر افتراضي يتجاوز 10 سنوات.",
                "features_en": "Direct flameproof construction, unaffected by oven back-heat, 10+ years operational lifespan.",
                "tips_ar": "استخدم شريط التيفلون المخصص للغاز الأصفر عند شد الوصلات الملولبة.",
                "tips_en": "Always apply yellow gas-rated PTFE Teflon tape onto male pipe threads prior to tightening.",
                "tag": "ستانلس ستيل مصفح",
            },
            {
                "name_ar": "طقم وصلات نحاسية سريعة الفك والتركيب",
                "name_en": "Quick-Release Brass Gas Fittings Set",
                "price": 6.00,
                "quantity": 80,
                "desc_ar": "طقم وصلات وتحويلات نحاسية نقية 100% مانعة للتسريب مع صمامات أمان تغلق الغاز تلقائياً عند فصل الخرطوم.",
                "desc_en": "Solid brass quick-connect gas fitting set with automatic shutoff valve engaging upon hose disconnect.",
                "features_ar": "نحاس نقي مقاوم للأكسدة، نظام فك كبس سريع بيد واحدة، إغلاق تلقائي يمنع هدر الغاز.",
                "features_en": "Pure forged brass, one-handed quick release sleeve, automatic gas shutoff upon disconnection.",
                "tips_ar": "مناسب لربط شوايات الحدائق والمواقد المتنقلة بأسطوانة الغاز بكل سهولة دون الحاجة لمفتاح شد.",
                "tips_en": "Perfect for hooking outdoor barbecues and camping stoves without needing heavy wrenches.",
                "tag": "نحاس نقي سريع الفك",
            },
        ],
    },
    {
        "name_ar": "كواشف وأنظمة إنذار تسريب الغاز",
        "name_en": "Gas Leak Detectors & Safety",
        "desc_ar": "أجهزة استشعار ذكية وصمامات غلق كهرومغناطيسية لحماية المنازل والمنشآت من مخاطر تسريب الغاز.",
        "desc_en": "Smart sensor detectors and electromagnetic shutoff valves protecting homes against LPG gas leaks.",
        "tag": "إنذار ذكي وحماية فورية",
        "products": [
            {
                "name_ar": "كاشف تسريب الغاز الذكي بشاشة رقمية",
                "name_en": "Smart Digital Gas Leak Detector & Alarm",
                "price": 19.50,
                "quantity": 40,
                "desc_ar": "جهاز استشعار تسريب غاز جداري مزود بشاشة LED تعرض نسبة تركيز الغاز مع إنذار صوتي فائق القوة 85 ديسيبل.",
                "desc_en": "Wall-mounted smart LPG detector with LED concentration screen and piercing 85dB audible siren alarm.",
                "features_ar": "حساس كيميائي ياباني عالي الحساسية، إنذار صوتي وضوئي متزامن، مخرج كهربائي للربط مع صمام الغلق التلقائي.",
                "features_en": "Japanese high-sensitivity catalytic sensor, 85dB siren + flashing strobe, 12V output for auto-valve.",
                "tips_ar": "ثبت الجهاز على بعد 30 سم من الأرض لأن غاز البترول المسال (LPG) أثقل من الهواء ويترسب لأسفل.",
                "tips_en": "Install 30cm above floor level because LPG gas is heavier than air and sinks downwards.",
                "tag": "شاشة رقمية وإنذار 85dB",
            },
            {
                "name_ar": "صمام غلق الغاز الكهرومغناطيسي التلقائي",
                "name_en": "Electromagnetic Gas Shut-Off Valve",
                "price": 24.00,
                "quantity": 35,
                "desc_ar": "صمام أمان كهربائي يتم تركيبه على خط الغاز الرئيسي ويغلق الإمداد في أقل من ثانية فور تلقي إشارة من الكاشف.",
                "desc_en": "Heavy-duty electromagnetic main line safety valve that automatically cuts gas supply in under 1 second.",
                "features_ar": "إغلاق كهرومغناطيسي فوري فائق السرعة، إعادة فتح يدوي فقط لضمان فحص التسريب أولاً، قياس نصف إنش نحاس.",
                "features_en": "Sub-second magnetic shutoff, manual-only pull reset to enforce inspection before reopening, 1/2-inch brass.",
                "tips_ar": "يتم ربطه بكاشف الغاز المنزلي ليوفر حماية أوتوماتيكية متكاملة حتى أثناء غيابك عن المنزل.",
                "tips_en": "Wire directly to the gas detector to guarantee automated protection even when away from home.",
                "tag": "غلق فوري في ثانية",
            },
            {
                "name_ar": "حساس تسريب غاز متصل بالواي فاي للهواتف",
                "name_en": "WiFi Smart LPG Gas Alarm Sensor",
                "price": 29.00,
                "quantity": 28,
                "desc_ar": "كاشف غاز ذكي يتصل بشبكة WiFi ويرسل إشعارات تحذيرية فورية لهاتفك المحمول عبر تطبيق Tuya أو Smart Life.",
                "desc_en": "Smart WiFi gas detector sending instant push notifications to your smartphone via Tuya / Smart Life app.",
                "features_ar": "إشعارات فورية على الهاتف من أي مكان، مراقبة مستمرة لحالة الأمان، متوافق مع أنظمة المنازل الذكية.",
                "features_en": "Real-time mobile push alerts anywhere in the world, 24/7 security log, compatible with Smart Home systems.",
                "tips_ar": "اربطه مع منبهات الهاتف للتأكد من وصول التنبيه حتى أثناء وضع الصامت.",
                "tips_en": "Enable critical alerts in app permissions so warning sounds even when phone is on silent mode.",
                "tag": "متصل بالواي فاي والتطبيق",
            },
        ],
    },
    {
        "name_ar": "طباخات وأفران الغاز المسطحة",
        "name_en": "Gas Stoves & Built-in Hobs",
        "desc_ar": "طباخات وأسطح طهي مدمجة تعمل بالغاز باستهلاك متوازن وشعلات نحاسية فائقة الكفاءة مع صمامات أمان.",
        "desc_en": "Built-in gas hobs and countertop stoves featuring high-efficiency brass burners and flame-failure safety.",
        "tag": "شعلات نحاسية متطورة",
        "products": [
            {
                "name_ar": "طباخ غاز مدمج 4 شعلات ستانلس ستيل",
                "name_en": "Built-in 4-Burner Stainless Steel Gas Hob",
                "price": 115.00,
                "quantity": 15,
                "desc_ar": "مسطح غاز بلت إن ستانلس ستيل 60 سم مع 4 شعلات إيطالية مختلفة الأحجام ونظام أمان كامل يقطع الغاز عند انطفاء اللهب.",
                "desc_en": "60cm built-in stainless steel gas hob with 4 Italian burners and full Flame Failure Device (FFD) safety.",
                "features_ar": "نظام أمان FFD لقطع الغاز الفوري، شبك ثقيل من حديد الزهر، إشعال كهربائي مدمج مع المفاتيح.",
                "features_en": "Full FFD flame failure auto cutoff, heavy cast-iron pan supports, integrated one-hand electronic ignition.",
                "tips_ar": "قم بتنظيف فوهات الشعلات النحاسية بانتظام لضمان خروج لهب أزرق نقي وقوي.",
                "tips_en": "Clean brass burner crown slots periodically to maintain optimal pure blue flame combustion.",
                "tag": "بلت إن ستانلس 60سم",
            },
            {
                "name_ar": "مسطح غاز زجاجي أسود 5 شعلات مع ووك",
                "name_en": "Black Tempered Glass 5-Burner Gas Hob",
                "price": 145.00,
                "quantity": 12,
                "desc_ar": "طباخ غاز مدمج فاخر 90 سم بسطح زجاجي أسود مقسى مع 5 شعلات تشمل شعلة ووك ثلاثية التاج للطهي السريع.",
                "desc_en": "Luxury 90cm black tempered glass gas hob with 5 burners including a central triple-ring high-power Wok burner.",
                "features_ar": "زجاج حراري أسود مقاوم للخدوش والصدمات، شعلة ووك توربو 3.8 كيلوواط، أمان إيطالي شامل لكافة الشعلات.",
                "features_en": "Scratch-resistant tempered safety glass, 3.8kW triple-ring turbo wok burner, complete safety thermocouples.",
                "tips_ar": "استخدم قطعة قماش ناعمة مبللة لتنظيف الزجاج بعد أن يبرد تماماً لتجنب الصدمات الحرارية.",
                "tips_en": "Clean the tempered glass with a soft damp cloth only after it has cooled down completely.",
                "tag": "زجاج أسود 5 شعلات 90سم",
            },
            {
                "name_ar": "طباخ غاز مكتبي مفرد سطح ستانلس",
                "name_en": "Compact Desktop Single-Burner Gas Stove",
                "price": 12.00,
                "quantity": 50,
                "desc_ar": "موقد غاز مكتبي صغير الحجم بعين واحدة قوية مثالي للمكاتب والاستوديوهات والمطابخ الصغيرة والرحلات.",
                "desc_en": "Compact single-burner countertop gas stove crafted with stainless top, ideal for offices and studios.",
                "features_ar": "سطح ستانلس ستيل سهل التنظيف، شعلة نحاسية موفرة للغاز، أرجل مطاطية مانعة للانزلاق على الأسطح.",
                "features_en": "Easy-to-clean stainless steel panel, gas-saving brass cap burner, non-slip rubber footing.",
                "tips_ar": "يوصل مباشرة بخرطوم الغاز المنزلي مع منظم 30 ملي بار.",
                "tips_en": "Connect directly with approved gas hose and standard domestic 30mbar regulator.",
                "tag": "موقد مكتبي مدمج",
            },
        ],
    },
    {
        "name_ar": "سخانات المياه بالغاز",
        "name_en": "Gas Water Heaters & Geysers",
        "desc_ar": "سخانات مياه فورية تعمل بالغاز باشتعال تلقائي وكفاءة عالية في توفير الطاقة والماء الساخن غير المحدود.",
        "desc_en": "Tankless instant gas water heaters providing continuous on-demand hot water with smart digital control.",
        "tag": "ماء ساخن فوري واقتصادي",
        "products": [
            {
                "name_ar": "سخان مياه غاز فوري 6 لتر ديجيتال",
                "name_en": "Instant Gas Water Heater 6L Digital",
                "price": 75.00,
                "quantity": 20,
                "desc_ar": "سخان غاز فوري يمنحك ماء ساخن غير محدود بمجرد فتح الصنبور مع شاشة رقمية لعرض درجة حرارة الماء بدقة.",
                "desc_en": "Tankless on-demand 6L gas water heater delivering continuous hot water with precise digital temperature display.",
                "features_ar": "يعمل حتى مع ضغط الماء المنخفض، إشعال تلقائي بحجارة البطارية، صمام أمان لقطع الغاز عند انطفاء اللهب.",
                "features_en": "Starts even under low water pressure (0.02 MPa), battery pulse ignition, anti-dry burning protection.",
                "tips_ar": "يجب تزويده بمدخنة تهوية خارجية وممنوع تركيبه داخل غرف الاستحمام المغلقة.",
                "tips_en": "Must be vented outdoors with appropriate chimney exhaust; do not install in enclosed bathrooms.",
                "tag": "فوري 6 لتر ديجيتال",
            },
            {
                "name_ar": "سخان مياه غاز ذكي 10 لتر عالي الكفاءة",
                "name_en": "Smart High-Capacity Gas Water Heater 10L",
                "price": 110.00,
                "quantity": 16,
                "desc_ar": "سخان غاز سعة 10 لتر في الدقيقة يلبي احتياجات العائلات الكبيرة وتشغيل دوشين معاً مع تحكم ذكي بثبات الحرارة.",
                "desc_en": "High-capacity 10L/min tankless gas water heater ideal for multiple simultaneous showers with constant temp.",
                "features_ar": "مبادل حراري من النحاس الخالي من الأكسجين، تحكم إلكتروني بتدفق الغاز والماء، حماية ضد التجمد في الشتاء.",
                "features_en": "Oxygen-free pure copper heat exchanger, smart water-gas dual modulation, winter anti-freeze protection.",
                "tips_ar": "اضبط درجة الحرارة على 42-45 درجة مئوية للاستحمام المثالي وتوفير أقصى قدر من الغاز.",
                "tips_en": "Set thermostat to 42-45°C for comfortable showering and maximum fuel economy.",
                "tag": "سعة عائلية 10 لتر",
            },
            {
                "name_ar": "سخان غاز صديق للبيئة منخفض الانبعاثات 8 لتر",
                "name_en": "Eco-Friendly Low-NOx Gas Water Heater 8L",
                "price": 95.00,
                "quantity": 14,
                "desc_ar": "سخان غاز متطور بتقنية الاحتراق النظيف منخفض الانبعاثات سعة 8 لتر يوفر حتى 30% من الغاز مقارنة بالسخانات التقليدية.",
                "desc_en": "Eco-friendly 8L gas water heater engineered with Low-NOx clean combustion saving up to 30% gas fuel.",
                "features_ar": "تقنية الاحتراق الجزئي النظيف، عزل حراري فائق، لوحة تحكم لمسية مع مؤقت أمان للإيقاف التلقائي بعد 20 دقيقة.",
                "features_en": "Segmented clean combustion burners, superior heat insulation, 20-minute safety timer shutoff.",
                "tips_ar": "يحتوي على مؤقت أمان يفصل السخان تلقائياً بعد 20 دقيقة من الاستخدام المتواصل للوقاية.",
                "tips_en": "Features an automatic 20-minute continuous timer cutoff as a preventive health and safety guard.",
                "tag": "موفر للغاز 30%",
            },
        ],
    },
    {
        "name_ar": "شوايات ومواقد الحدائق",
        "name_en": "Outdoor Gas Grills & BBQs",
        "desc_ar": "شوايات باربيكيو خارجية فاخرة ومواقد طهي قوية للمزارع والحدائق والاستراحات والرحلات الخارجية.",
        "desc_en": "Premium outdoor barbecue gas grills and heavy cast-iron stoves for gardens, patios, and outdoor cooking.",
        "tag": "شواء خارجي فاخر",
        "products": [
            {
                "name_ar": "شواية غاز حدائق 3 شعلات مع رف جانبي",
                "name_en": "3-Burner Outdoor Gas BBQ Grill with Side Shelf",
                "price": 165.00,
                "quantity": 10,
                "desc_ar": "شواية غاز خارجية فاخرة مزودة بـ 3 شعلات ستانلس ستيل مع مقياس حرارة على الغطاء ورفوف جانبية لإعداد الطعام.",
                "desc_en": "Premium 3-burner stainless steel outdoor gas BBQ grill with built-in lid thermometer and folding side prep tables.",
                "features_ar": "شبك شواء مطلي بالبورسلان غير لاصق، درج سفلي لتجميع الزيوت وسهولة التنظيف، عجلات قفل لنقل آمن.",
                "features_en": "Porcelain-enameled non-stick cooking grids, slide-out grease tray for easy cleaning, locking caster wheels.",
                "tips_ar": "قم بتسخين الشواية وهي مغلقة لمدة 10 دقائق قبل وضع اللحوم للحصول على علامات الشواء المثالية.",
                "tips_en": "Preheat with lid closed for 10 minutes prior to placing meats to achieve perfect sear marks.",
                "tag": "شواية 3 شعلات مع رفوف",
            },
            {
                "name_ar": "موقد طهي خارجي شعلة توربو ثقيلة",
                "name_en": "Heavy-Duty Outdoor Turbo Cast Iron Gas Stove",
                "price": 28.00,
                "quantity": 35,
                "desc_ar": "موقد غاز أرضي صب حديد ثقيل شعلة توربو بقوة حرارية هائلة مخصص لقدور الطهي الكبيرة والمناسف في العزائم.",
                "desc_en": "Heavy cast-iron single turbo burner gas stove engineered for massive pots, outdoor catering, and events.",
                "features_ar": "هيكل حديد صب يتحمل أوزان تفوق 100 كغ، حلقة شعلة ثلاثية فائقة القوة، صمامات نحاسية مزدوجة للتحكم.",
                "features_en": "Cast-iron frame supporting over 100kg load, high-BTU triple flame ring, dual brass needle control valves.",
                "tips_ar": "يستخدم مع منظم غاز ضغط عالي للحصول على قوة اللهب القصوى.",
                "tips_en": "Operate with a high-pressure regulator to unleash maximum flame output and heat capacity.",
                "tag": "حديد صب للقدور الكبيرة",
            },
            {
                "name_ar": "شواية باربيكيو متنقلة بعجلات وشعلتين",
                "name_en": "Portable 2-Burner Gas Grill with Wheels",
                "price": 89.00,
                "quantity": 15,
                "desc_ar": "شواية غاز مدمجة ذات شعلتين قابلة للطي وسهلة الجر بعجلات، ممتازة للتنقل في الرحلات والحدائق المنزلية الصغيرة.",
                "desc_en": "Collapsible portable 2-burner gas grill with all-terrain wheels, perfect for tailgating and compact patios.",
                "features_ar": "تصميم قابل للطي يوفر المساحة، إشعال سريع بكبسة زر، توزيع حراري متجانس على كامل الشبك.",
                "features_en": "Fold-and-go collapsible trolley frame, push-button rapid ignition, even heat distribution across grids.",
                "tips_ar": "تأكد من نظافة صينية جمع الدهون بعد كل استخدام لتجنب اشتعال الزيوت.",
                "tips_en": "Always empty and wipe the drip tray after each grilling session to prevent flare-ups.",
                "tag": "شواية متنقلة بعجلات",
            },
        ],
    },
    {
        "name_ar": "ملحقات وقطع غيار الغاز",
        "name_en": "Gas Accessories & Spare Parts",
        "desc_ar": "قطع غيار أصلية ومفاتيح أسطوانات وقواعد متينة لحماية وتسهيل استخدام الغاز بأعلى درجات الراحة والأمان.",
        "desc_en": "Original replacement parts, heavy cylinder dollies, wrenches, and brass safety accessories.",
        "tag": "ملحقات وقطع أصلية",
        "products": [
            {
                "name_ar": "مفتاح فك وتركيب أسطوانات الغاز عالي المتانة",
                "name_en": "Ergonomic Heavy-Duty Gas Cylinder Wrench",
                "price": 3.50,
                "quantity": 110,
                "desc_ar": "مفتاح أسطوانات غاز ذو مقبض مطاطي مريح مصبوب من الفولاذ الكربوني لفك وشد صواميل الغاز دون تجريحها أو إتلافها.",
                "desc_en": "Ergonomic rubber-grip gas cylinder wrench forged from carbon steel for effortless tightening without slipping.",
                "features_ar": "قياس دقيق يناسب كافة صواميل المنظمات المنزلية، مقبض مريح مقاوم للانزلاق، تصميم متين لا ينكسر.",
                "features_en": "Exact fit for domestic cylinder regulator nuts, comfortable anti-slip grip, unbreakable forged steel.",
                "tips_ar": "تذكر أن سن لولب صامولة الغاز عكسي (يُشد باتجاه عكس عقارب الساعة).",
                "tips_en": "Remember that gas regulator union threads are reverse-threaded (turn counter-clockwise to tighten).",
                "tag": "مفتاح فك أسطوانة مريح",
            },
            {
                "name_ar": "قاعدة أسطوانة غاز متحركة بـ 4 عجلات قوية",
                "name_en": "Mobile Gas Cylinder Base with 4 Heavy Castors",
                "price": 8.00,
                "quantity": 75,
                "desc_ar": "قاعدة دائرية متينة لأسطوانات الغاز مزودة بـ 4 عجلات تدور 360 درجة لحماية البلاط وسهولة تحريك الأسطوانة دون مجهود.",
                "desc_en": "Heavy-duty circular gas cylinder trolley with 4 swivel caster wheels to protect floors and move cylinders easily.",
                "features_ar": "حافة مرتفعة تمنع انزلاق الأسطوانة، عجلات ناعمة لا تخدش السيراميك، تتحمل وزن حتى 60 كغ.",
                "features_en": "Raised lip preventing cylinder slide-off, non-marking smooth wheels, supports up to 60kg load.",
                "tips_ar": "تحمي أرضية المطبخ من الصدأ والخدوش وتسهل تنظيف ما تحت الأسطوانة باستمرار.",
                "tips_en": "Protects kitchen flooring from rust stains and scratches while facilitating quick floor cleaning.",
                "tag": "قاعدة متحركة 4 عجلات",
            },
            {
                "name_ar": "طقم فوهات وشعلات نحاسية بديلة للغاز",
                "name_en": "Universal Brass Gas Jet & Burner Nozzles Kit",
                "price": 5.50,
                "quantity": 95,
                "desc_ar": "طقم فونيات وفوهات غاز نحاسية نقية متعددة المقاسات مخصصة لضبط وتحويل الطباخات والأفران لغاز LPG المنزلي.",
                "desc_en": "Universal brass gas injector jets and nozzle conversion kit calibrated for domestic LPG cylinder pressure.",
                "features_ar": "نحاس مخرطة فائق الدقة، ثقوب ليزرية للمعايرة الصحيحة للهب، تشمل مقاسات من 0.50 إلى 0.95 ملم.",
                "features_en": "Precision CNC-machined solid brass, laser-drilled jet orifices, sizes ranging from 0.50mm to 0.95mm.",
                "tips_ar": "اختر مقاس الفونية المناسب لحجم كل شعلة لتحصل على لهب أزرق كفء وتمنع السواد على الأواني.",
                "tips_en": "Match each jet size to the corresponding burner rating to guarantee optimal soot-free blue flame.",
                "tag": "فواني نحاس ليزرية",
            },
        ],
    },
]

# ─────────────────────────────────────────────────────────────────────────────
# Seeder Execution
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print("      Master Gas (ماستر غاز) - بدء زراعة الأقسام والمنتجات")
    print("=" * 70)

    # 1. Login
    print(f"\n[1/4] تسجيل الدخول إلى السيرفر كمسؤول: {LOGIN_EMAIL} ...")
    login_res = requests.post(
        f"{API_BASE}/v1/login",
        json={"email": LOGIN_EMAIL, "password": LOGIN_PASS},
        headers={"Accept": "application/json"}
    )
    if login_res.status_code != 200:
        print(f"❌ فشل تسجيل الدخول: HTTP {login_res.status_code} - {login_res.text}")
        sys.exit(1)

    token = login_res.json().get("token")
    print("✔ تم استلام توكن المشرف بنجاح.")

    auth_headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }

    # 2. Process Categories & Products
    print("\n[2/4] توليد الصور ورفع الأقسام والمنتجات ...")
    created_categories = []
    created_products = []

    cat_idx = 1
    prod_idx = 1

    for cat in CATALOG:
        # Generate Category Image
        cat_img_name = f"cat_{cat_idx}.jpg"
        cat_img_path = create_card_image(
            filename=cat_img_name,
            title_ar=cat["name_ar"],
            title_en=cat["name_en"],
            subtitle_ar=cat["desc_ar"][:55] + "...",
            tag_text=cat["tag"],
            price_text=None,
            is_category=True
        )

        print(f"\n▶ إنشاء القسم ({cat_idx}/10): {cat['name_ar']} ...")
        cat_form_data = {
            "name": json.dumps({"ar": cat["name_ar"], "en": cat["name_en"]}),
            "description": json.dumps({"ar": cat["desc_ar"], "en": cat["desc_en"]}),
            "is_active": "1",
            "sort_order": str(cat_idx),
        }

        with open(cat_img_path, "rb") as img_file:
            files = {"image": (cat_img_name, img_file, "image/jpeg")}
            res = requests.post(f"{API_BASE}/dashboard/categories", data=cat_form_data, files=files, headers=auth_headers)

        if res.status_code not in (200, 201):
            print(f"  ❌ فشل إنشاء القسم: HTTP {res.status_code} - {res.text}")
            continue

        cat_res_data = res.json().get("data", {})
        cat_id = cat_res_data.get("id")
        cat_img_url = cat_res_data.get("image", "")
        print(f"  ✔ تم إنشاء القسم بنجاح! ID: {cat_id}")

        created_categories.append({
            "id": cat_id,
            "name_ar": cat["name_ar"],
            "name_en": cat["name_en"],
            "image": cat_img_url,
            "products_count": len(cat["products"])
        })

        # Process Products in this Category
        for prod in cat["products"]:
            prod_img_name = f"prod_{prod_idx}.jpg"
            prod_img_path = create_card_image(
                filename=prod_img_name,
                title_ar=prod["name_ar"],
                title_en=prod["name_en"],
                subtitle_ar=prod["features_ar"][:55] + "...",
                tag_text=prod["tag"],
                price_text=f"{prod['price']:.2f} د.أ",
                is_category=False
            )

            print(f"   ├─ إنشاء المنتج ({prod_idx}/30): {prod['name_ar']} ({prod['price']} د.أ) ...")
            
            prod_form_data = {
                "name": json.dumps({"ar": prod["name_ar"], "en": prod["name_en"]}),
                "price": str(prod["price"]),
                "quantity": str(prod["quantity"]),
                "is_active": "1",
                "category_id": str(cat_id),
                "discount": "0",
                "description": json.dumps({"ar": prod["desc_ar"], "en": prod["desc_en"]}),
                "features": json.dumps({"ar": prod["features_ar"], "en": prod["features_en"]}),
                "tips": json.dumps({"ar": prod["tips_ar"], "en": prod["tips_en"]}),
                "shipping_info": json.dumps({
                    "ar": "توصيل سريع لكافة محافظات المملكة الأردنية الهاشمية خلال 24-48 ساعة مع فحص الأمان عند الاستلام.",
                    "en": "Express doorstep delivery across Jordan within 24-48 hours with complimentary safety check upon delivery."
                }),
                "attributes": json.dumps({
                    "الضمان": ["سنتان صيانة واستبدال"],
                    "المواصفات": ["مطابق للمواصفات والمقاييس الأردنية JQM"]
                }),
            }

            with open(prod_img_path, "rb") as p_file:
                p_files = [("images[]", (prod_img_name, p_file, "image/jpeg"))]
                p_res = requests.post(f"{API_BASE}/dashboard/products", data=prod_form_data, files=p_files, headers=auth_headers)

            if p_res.status_code in (200, 201):
                p_data = p_res.json().get("data", {})
                prod_id = p_data.get("id")
                prod_imgs = p_data.get("images", [])
                p_img_url = prod_imgs[0] if prod_imgs else ""
                print(f"   │  ✔ تم إنشاء المنتج بنجاح! ID: {prod_id}")
                created_products.append({
                    "id": prod_id,
                    "category_id": cat_id,
                    "category_name": cat["name_ar"],
                    "name_ar": prod["name_ar"],
                    "name_en": prod["name_en"],
                    "price": prod["price"],
                    "quantity": prod["quantity"],
                    "image": p_img_url,
                })
            else:
                print(f"   │  ❌ فشل إنشاء المنتج: HTTP {p_res.status_code} - {p_res.text}")

            prod_idx += 1
            time.sleep(0.1) # Graceful pacing

        cat_idx += 1

    # 3. Save Summary JSON
    summary_path = "/tmp/mastergas_catalog/created_catalog.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump({
            "categories": created_categories,
            "products": created_products,
            "total_categories": len(created_categories),
            "total_products": len(created_products)
        }, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 70)
    print("      🎉 اكتملت زراعة الكتالوج بالكامل بنجاح!")
    print(f"      إجمالي الأقسام المنشأة: {len(created_categories)} / 10")
    print(f"      إجمالي المنتجات المنشأة: {len(created_products)} / 30")
    print(f"      تم حفظ السجل الكامل في: {summary_path}")
    print("=" * 70)

if __name__ == "__main__":
    main()
