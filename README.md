# मान ट्रेडर्स — Website

kirana pasal website. Plain HTML/CSS/JS (no build step) → GitHub Pages मा host हुन्छ, product catalog Supabase बाट आउँछ।

## Structure
```
index.html
css/style.css
js/config.js      # Supabase URL + anon key यहाँ राख्नुहोस्
js/app.js         # catalog fetch/render logic
supabase-schema.sql
```

## 1. Supabase Setup
1. https://supabase.com मा नयाँ project बनाउनुहोस्।
2. Dashboard -> **SQL Editor** मा `supabase-schema.sql` को पूरा content paste गरेर **Run** थिच्नुहोस्। यसले `categories` र `products` table, RLS policy (public read-only), र नमूना डाटा बनाउँछ।
3. Dashboard -> **Settings -> API** बाट:
   - **Project URL**
   - **anon public** key
   दुवै कपी गर्नुहोस्।
4. `js/config.js` खोलेर ती दुई value भर्नुहोस्:
   ```js
   export const SUPABASE_URL = "https://xxxx.supabase.co";
   export const SUPABASE_ANON_KEY = "eyJ...";
   export const WHATSAPP_NUMBER = "9779800000000"; // पसलको वास्तविक नम्बर
   ```
   > anon/public key सार्वजनिक राख्न सुरक्षित छ (यो site table मा लेख्दैन, पढ्छ मात्र — RLS ले लेख्ने अनुमति दिँदैन)।

5. सामान थप्न/मेटाउन/भाउ बदल्न: Supabase Dashboard -> **Table Editor -> products** मा जानुहोस्।
   - `is_featured = true` गरेको सामान होमपेजको "आजको भाउ" board मा देखिन्छ (बढीमा ५ वटा)।
   - `image_url` खाली छोड्दा श्रेणी अनुसारको icon देखिन्छ; फोटो चाहेमा त्यहाँ direct image URL राख्न सकिन्छ (जस्तै Supabase Storage को public URL)।

## 2. GitHub Pages मा Deploy
1. GitHub मा नयाँ repository बनाउनुहोस् (जस्तै `manastraders-site`)।
2. यी सबै फाइल (`index.html`, `css/`, `js/`, आदि) त्यो repo मा push गर्नुहोस्:
   ```bash
   git init
   git add .
   git commit -m "Mana Traders website"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```
3. GitHub repo -> **Settings -> Pages** मा जानुहोस्।
   - Source: **Deploy from a branch**
   - Branch: `main` / `root`
   - Save गर्नुहोस्।
4. केही मिनेटमा साइट `https://<username>.github.io/<repo>/` मा लाइभ हुन्छ।

## 3. Custom domain (manastraders.com.np) जोड्ने
1. GitHub repo -> **Settings -> Pages -> Custom domain** मा `manastraders.com.np` राखेर save गर्नुहोस् — यसले repo मा `CNAME` फाइल बनाउँछ।
2. आफ्नो domain registrar (जहाँ `.com.np` किनेको हो) मा गएर DNS मा यी record थप्नुहोस्:
   - **A records** (apex domain manastraders.com.np को लागि) GitHub Pages का IP हरूतिर पोइन्ट गर्ने:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - वा `www` subdomain प्रयोग गर्ने हो भने **CNAME record**: `<username>.github.io`
3. DNS propagate हुन केही समय लाग्छ (आधा घण्टा देखि २४ घण्टासम्म)। त्यसपछि GitHub Pages settings मा **Enforce HTTPS** on गर्नुहोस्।

## Local मा हेर्न
कुनै पनि static server चलाउनुहोस् (module import भएकोले सिधै file खोल्दा काम नगर्न सक्छ):
```bash
npx serve .
# वा
python3 -m http.server 8080
```
