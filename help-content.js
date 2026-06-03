/* ─────────────────────────────────────────────────────────────
   Packcheck: Philmont Edition — User Guide content
   Edit this file to update the in-app help modal.
   Each section: { title, items: [{ q, a }] }
   'a' may contain basic HTML (<strong>, <code>, <a>, <br>).
   ───────────────────────────────────────────────────────────── */
const HELP_CONTENT = [
  {
    title: "Getting Started",
    items: [
      {
        q: "What is this app?",
        a: "Packcheck: Philmont Edition is a pack weight planner built for Philmont treks. Add your gear, check what you're bringing, and see your total weight before you leave home."
      },
      {
        q: "Do I need to make an account?",
        a: "No. Everything saves automatically in your browser. Nothing is sent to a server."
      },
      {
        q: "Will my data disappear if I close the tab?",
        a: "No. Your gear list saves automatically every time you make a change. It will be there when you come back — on the same device and browser."
      },
      {
        q: "How do I start?",
        a: "Tap your name in the header to set up your profile. Enter your name, crew number, and trek info. Then go to the Gear List tab and start checking items."
      }
    ]
  },
  {
    title: "Using the Gear List",
    items: [
      {
        q: "How do I check an item as packed?",
        a: "Tap the checkbox on the left side of any item. Checked items count toward your pack weight. Unchecked items are grayed out."
      },
      {
        q: "How do I check everything at once?",
        a: "Use the \"Select / Deselect All\" checkbox at the top of the gear list. One click checks everything. Click again to clear everything."
      },
      {
        q: "How do I edit an item?",
        a: "On desktop, double-click the row. On mobile, press and hold the row for about half a second."
      },
      {
        q: "How do I add a new item?",
        a: "Click the <strong>+ Add Item</strong> button at the bottom of any gear category."
      },
      {
        q: "Can I move an item to a different category?",
        a: "Yes. In the actions column, use the category dropdown to reassign an item to a different category."
      },
      {
        q: "What does the cotton warning mean?",
        a: "Philmont does not recommend cotton on trail. Items flagged with a cotton warning will show a yellow caution icon. Cotton absorbs moisture and doesn't dry out. On trail, that becomes a safety issue."
      }
    ]
  },
  {
    title: "Understanding Your Weight",
    items: [
      {
        q: "What is base weight?",
        a: "Base weight is everything in your pack except food, water, and fuel. It's the weight you carry every day of the trek."
      },
      {
        q: "What is trail weight?",
        a: "Trail weight is your base weight plus food, water, and fuel. This is what your pack actually weighs when you walk out of camp in the morning."
      },
      {
        q: "What is the pack weight limit at Philmont?",
        a: "Philmont recommends your trail weight stay under 25–30% of your body weight. The Pack Weight tab calculates this for you based on your body weight and shows where you land each day."
      },
      {
        q: "Do I really have to weigh every single item?",
        a: "No. You can always weigh your entire pack and use that number for your base weight. But to really take advantage of the app and optimize your load, knowing where every ounce goes can make a big difference. Remember: you pack it, you carry it."
      },
      {
        q: "Why does my weight change between days?",
        a: "Food and water. The Pack Weight tab simulates your weight day by day as you consume food and hit water sources. Dry camp days will be heavier because you carry more water."
      }
    ]
  },
  {
    title: "Sharing and Syncing",
    items: [
      {
        q: "How do I get my list onto my phone?",
        a: "On desktop, open the menu (☰) and tap <strong>Share / QR Code</strong>. Scan the code with your phone camera. It opens your gear list in the phone's browser automatically."
      },
      {
        q: "How do I save my list as a file?",
        a: "Tap the red <strong>Save</strong> button in the header. This downloads a <code>.json</code> file you can reload anytime."
      },
      {
        q: "How do I load a saved list?",
        a: "Open the menu (☰) and tap <strong>Load</strong>. Select your <code>.json</code> file."
      },
      {
        q: "Can I share my list with my crew leader?",
        a: "Yes. Save the file and send it — email, text, AirDrop, whatever works. They can load it with the Load option in the menu."
      }
    ]
  },
  {
    title: "Crew Gear",
    items: [
      {
        q: "What is crew gear?",
        a: "Crew gear is equipment shared across the whole crew — tents, crew cook sets, bear bags, etc. Packcheck divides the weight equally per person so you can see your true share."
      },
      {
        q: "Hey wait a second, my crew gear changed. I didn't touch anything.",
        a: "That's right. Your Lead Advisor has the ability to update the crew gear list for everyone on the trek. It updates automatically every time you refresh the app."
      },
      {
        q: "Can I edit the crew gear?",
        a: "Yes, but if the Lead Advisor makes an update it will override your changes. You should consider the crew gear list \"locked\"."
      }
    ]
  },
  {
    title: "Itinerary and Menus",
    items: [
      {
        q: "How does the itinerary work?",
        a: "The Itinerary tab shows your trek day by day — camps, miles, elevation, and difficulty. It's pre-loaded for Trek 12-10."
      },
      {
        q: "What about meals?",
        a: "Each itinerary day shows the meal rotation for that day. The menu cycles through Philmont's standard 10-meal rotation."
      }
    ]
  },
  {
    title: "Misc",
    items: [
      {
        q: "How do I print a checklist?",
        a: "Open the menu (☰) and tap <strong>Print</strong>."
      },
      {
        q: "How do I export to Excel?",
        a: "Open the menu (☰) and tap <strong>Export Excel</strong>."
      },
      {
        q: "Something isn't working. Who do I contact?",
        a: "Send a note to <a href=\"mailto:packcheck.app@gmail.com\" style=\"color:var(--pc-accent);\">packcheck.app@gmail.com</a>."
      }
    ]
  }
];
