import { useState, useEffect, useRef } from 'react';
import useInView from '../hooks/useInView';
import useBreakpoint from '../hooks/useBreakPoint';

// ── Cover images (Unsplash) ───────────────────────────────────
const coverImg = (id, w = 800, h = 480) =>
    `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=88&fit=crop&auto=format`;

const STORIES = [
    {
        id: 1, category: 'CULTURE', accent: '#FF6B35',
        title: 'How Street Art Is Reshaping Sneaker Design',
        author: 'JAMES OKAFOR', authorRole: 'Culture Editor', date: 'FEB 12, 2025', readTime: '6 MIN',
        cover: coverImg('1542291026-7eec264c27ff'),
        excerpt: 'From the walls of São Paulo to the runways of Milan — the underground art movement is leaving its mark on every major sneaker brand.',
        body: [
            { type: 'lead', text: 'Somewhere between a spray can and a last, a revolution was born. For decades, graffiti artists and sneaker designers occupied parallel universes — one celebrated in museums, the other in shopping malls. That border has dissolved.' },
            { type: 'p', text: "The shift began quietly, in the early 2000s, when Nike tapped Stash and Futura to create limited colorways. These weren't marketing moves. They were admissions: the street knew something the corporation didn't. Color. Risk. Energy. The willingness to say something with a silhouette." },
            { type: 'h2', text: 'São Paulo Changed Everything' },
            { type: 'p', text: "Brazil's street art scene — arguably the densest in the world per square kilometer — has been exporting visual language to sneaker labs for twenty years. Artists like Os Gêmeos and Herbert Baglione taught brands that a shoe could be a canvas, and that canvas could be a wall, and that wall could be a city speaking to itself." },
            { type: 'p', text: 'APEX felt this energy early. Our first collab with MARZ wasn\'t a business decision — it was a conversation. MARZ had been painting São Paulo\'s Vila Madalena district for eight years before we called. When we sat down together, he had one condition: "The shoe can\'t look like it was made by a company. It has to look like it was made by the street."' },
            { type: 'quote', text: '"The shoe can\'t look like it was made by a company. It has to look like it was made by the street."', attribution: 'MARZ, Artist' },
            { type: 'h2', text: 'From Wall to Wearable' },
            { type: 'p', text: 'The technical challenge is enormous. A spray can has infinite resolution and a natural fade. A shoe has seams, material transitions, flex points. Translating one medium to another requires something more than skill — it requires rethinking what the design is trying to do.' },
            { type: 'p', text: "APEX's design lab in Tokyo spent four months developing a UV-reactive ink system that allows gradients to shift under different light. Walk under a streetlight in the MARZ collab and you're wearing one shoe. Step into a gallery and you're wearing another. The wall, in a sense, travels with you." },
            { type: 'h2', text: 'The Future is Permeable' },
            { type: 'p', text: 'What street art gave sneaker culture wasn\'t just aesthetics. It gave permission. Permission to be loud, to be political, to be impermanent. A shoe that wears out is a shoe that lived. A colorway that fades was actually worn. The message in the medium is: use me.' },
            { type: 'p', text: 'The next generation of collaborators will be even less interested in categories. They won\'t call themselves street artists or sneaker designers. They\'ll call themselves something we don\'t have a word for yet. And their work will be extraordinary.' },
        ],
    },
    {
        id: 2, category: 'PERFORMANCE', accent: '#38BDF8',
        title: 'Inside the Lab: Carbon Plate Technology Explained',
        author: 'DR. YUKI TANAKA', authorRole: 'Head of Engineering', date: 'FEB 5, 2025', readTime: '8 MIN',
        cover: coverImg('1606107557195-0e29a4b5b4aa'),
        excerpt: 'Our head engineer breaks down the science of how carbon fiber plates transform every stride into explosive forward propulsion.',
        body: [
            { type: 'lead', text: 'Carbon fiber is not magic. It is physics, applied with precision, at the moment your foot needs it most. Let me explain exactly how that works.' },
            { type: 'p', text: 'When your foot strikes the ground during a run, it compresses the midsole. Energy is stored in that compression — like a spring being loaded. The question every midsole designer has always faced is: how do you release that stored energy forward, not sideways, not upward, but forward?' },
            { type: 'h2', text: 'The Problem with Foam' },
            { type: 'p', text: 'Foam is excellent at absorbing energy. It is less excellent at returning it directionally. A pure foam midsole returns energy in all directions simultaneously — a radial dispersal that feels soft underfoot but wastes propulsive force. You feel cushioned. You don\'t feel propelled.' },
            { type: 'h2', text: 'Where Carbon Changes the Equation' },
            { type: 'p', text: 'A carbon fiber plate, embedded in the midsole at a specific curvature and stiffness, acts as a guide rail for energy return. When the foam compresses, the plate resists deformation. When the foot begins its toe-off phase, the plate springs back — but only along its axis of curvature, directing that energy forward.' },
            { type: 'quote', text: 'A carbon plate doesn\'t create energy. It steals nothing from your stride. It simply ensures that the energy you put in comes back to you in the direction you\'re already moving.', attribution: 'Dr. Yuki Tanaka' },
            { type: 'p', text: "APEX's ReactPlate™ is curved at 18 degrees — a number we arrived at after three years of gait analysis across 1,400 runners of varying biomechanics. Too little curve and the plate is decorative. Too much and it creates instability. 18 degrees is, empirically, the sweet spot for propulsive efficiency across the widest range of foot strikes." },
            { type: 'h2', text: 'The 40% Number' },
            { type: 'p', text: 'We often cite a 40% improvement in energy return versus leading foam-only competitors. That figure comes from independent lab testing using a standardized mechanical striker at 8:30/mile pace. We stand behind it, but we also want to contextualize it: 40% more efficient energy return does not mean 40% faster running. It means 40% less energy wasted per stride — which, compounded over a 10K, means arriving at the finish line with more of yourself left.' },
        ],
    },
    {
        id: 3, category: 'SUSTAINABILITY', accent: '#34D399',
        title: 'The Road to 100% Recycled Materials',
        author: 'AMARA DIALLO', authorRole: 'Sustainability Director', date: 'JAN 28, 2025', readTime: '5 MIN',
        cover: coverImg('1543508282-6319a3e2621f'),
        excerpt: "Apex's ambitious pledge to achieve fully sustainable manufacturing by 2027 — and the real challenges standing in the way.",
        body: [
            { type: 'lead', text: 'Making a sneaker sustainably is not one problem. It is forty-seven problems, each with its own supply chain, chemistry, and compromise. Here is where we stand.' },
            { type: 'p', text: 'In 2022, we reached 60% recycled material content across our full range. We celebrated that milestone for about a week. Then we looked at what the remaining 40% was and why it was still there, and we got back to work.' },
            { type: 'h2', text: 'The Hard Remaining 40%' },
            { type: 'p', text: 'The materials in that 40% aren\'t there because we haven\'t tried to replace them. They\'re there because no suitable sustainable replacement currently exists at manufacturing scale. The primary offenders are: high-tenacity carbon fiber (used in the ReactPlate), polyurethane adhesive compounds, and certain foam blowing agents.' },
            { type: 'p', text: 'We\'ve invested $4.2M in partnerships with material science labs to develop replacements. Two of those partnerships are showing real promise. One — a bio-based foam blowing agent developed with a team at Delft University — will enter production testing in Q2 2025.' },
            { type: 'quote', text: 'The question isn\'t whether sustainable materials can match performance. The question is whether we can develop them before the planet runs out of patience.', attribution: 'Amara Diallo' },
            { type: 'h2', text: '2027 Is Real' },
            { type: 'p', text: 'We\'re keeping the 2027 deadline. It is not a marketing date. Every product roadmap decision we make is evaluated against this commitment. There have been designs we\'ve shelved because we couldn\'t reach the material threshold. There have been collab requests we\'ve declined for the same reason. The target shapes the work.' },
        ],
    },
    {
        id: 4, category: 'STYLE', accent: '#FBBF24',
        title: 'How to Style the Void Runner in 2025',
        author: 'MIKO CHEN', authorRole: 'Style Editor', date: 'JAN 20, 2025', readTime: '4 MIN',
        cover: coverImg('1608231387042-66d1773d3028'),
        excerpt: 'Five complete outfits built around the season\'s most versatile silhouette. From gym to gallery.',
        body: [
            { type: 'lead', text: 'The Void Runner shouldn\'t work as a lifestyle shoe. It\'s chunky, aggressively technical, and runs exclusively in a palette that suggests industrial accident. And yet it has quietly become the most styled shoe of the year.' },
            { type: 'p', text: 'The reason, I think, is contrast. In a moment where fashion is obsessed with softness — flowing fabrics, muted tones, quiet luxury — the Void Runner is a counterargument. It says: I have somewhere to be, and I\'m going there fast.' },
            { type: 'h2', text: 'Look 1: The Gallery Walk' },
            { type: 'p', text: 'Pair the Void in all-black with wide-leg tailored trousers (dark grey or charcoal, never black-on-black) and an oversized merino crewneck. The shoe does the talking. Everything else is negative space. Add one accent — a brass ring, a structured tote — and walk slowly.' },
            { type: 'h2', text: 'Look 2: The Early Shift' },
            { type: 'p', text: 'White Void Runner. Dark selvedge denim, straight cut. A vintage utility jacket, slightly oversized. This reads effortless because it is: three pieces, each with their own history, assembled with intent.' },
            { type: 'quote', text: 'The Void Runner says: I have somewhere to be, and I\'m going there fast.', attribution: 'Miko Chen, Style Editor' },
            { type: 'h2', text: 'Look 3: The Weekend Uniform' },
            { type: 'p', text: 'Track pants (not joggers — actual track pants, with a side stripe) in navy or burgundy. Plain white tee tucked loosely. Void Runner in the season\'s strongest colorway — this season, the Ember × KOTO. This is the look that makes people ask where you got the shoes.' },
            { type: 'p', text: 'What makes the Void Runner work across all of these? Its neutrality of intention. It doesn\'t want to be a running shoe in the street. It doesn\'t want to be a fashion shoe on the track. It wants to be exactly what you need it to be, and it has enough character to make that work.' },
        ],
    },
    {
        id: 5, category: 'COMMUNITY', accent: '#F87171',
        title: 'Meet the APEX Run Club: Tokyo Chapter',
        author: 'RIKU SATO', authorRole: 'Community Reporter', date: 'JAN 15, 2025', readTime: '7 MIN',
        cover: coverImg('1600185365926-3a2ce3cdb9eb'),
        excerpt: 'At 5am every Saturday, 200 runners gather in Yoyogi Park. This is the story of how a sneaker brand became a movement.',
        body: [
            { type: 'lead', text: "It's 4:55am in Yoyogi Park and the city hasn't woken up yet. But the APEX Run Club has been here, in the blue pre-dawn, every Saturday for two years." },
            { type: 'p', text: 'Two hundred and twelve runners showed up last week. Architects, nurses, software engineers, students, retirees. They came from Shibuya, from Nerima, from as far as Chiba. They wore different shoes. Many did not wear Apex. Nobody cared.' },
            { type: 'h2', text: 'How It Started' },
            { type: 'p', text: 'Haruto Miyazaki started the club in March 2023 with four friends and a group chat. He\'d been frustrated by the transactional nature of fitness apps — the gamification, the data anxiety, the competitive loneliness. "I wanted to run with people," he told me. "Not run at them."' },
            { type: 'p', text: 'APEX found the club through Instagram, as brands do. But what followed the initial contact was unusual: rather than a sponsorship pitch, APEX asked if they could show up and run. No activation. No banners. Just run. Haruto said yes.' },
            { type: 'quote', text: '"I wanted to run with people. Not run at them."', attribution: 'Haruto Miyazaki, Founder ARC Tokyo' },
            { type: 'h2', text: 'What a Run Club Actually Is' },
            { type: 'p', text: 'I ran with them for three Saturdays to report this piece. I am not a runner. The group absorbed me without comment, slowed for me without complaint, and pushed me slightly — just slightly — beyond what I thought I could do. At the end of each run, everyone walks to a konbini. Hot canned coffee. Onigiri. Then back to their lives.' },
            { type: 'p', text: 'The APEX Run Club Tokyo is now one of forty-seven chapters globally. There are chapters in Berlin, Lagos, São Paulo, Melbourne, and Montreal. Each began the same way: someone, somewhere, who just wanted to run with people.' },
        ],
    },
    {
        id: 6, category: 'DESIGN', accent: '#94A3B8',
        title: 'The Obsidian Pro: A Design Retrospective',
        author: 'SOFIA GUERRA', authorRole: 'Creative Director', date: 'JAN 8, 2025', readTime: '9 MIN',
        cover: coverImg('1595950653106-6c9ebd614d3a'),
        excerpt: 'Three years in development, seven rejected prototypes, and one visionary brief that changed the direction of the brand.',
        body: [
            { type: 'lead', text: 'The first Obsidian Pro prototype was rejected in eleven minutes. I was in the room. I watched our founder look at it for sixty seconds without speaking, then say: "This is a beautiful shoe. Build the shoe we meant."' },
            { type: 'p', text: "I've been thinking about that sentence for three years. What does it mean to build the shoe you meant? Not the shoe you made. Not the shoe you could make. The shoe that exists, fully formed, in the intention — before the compromises, before the tooling constraints, before the budget conversations." },
            { type: 'h2', text: 'The Brief' },
            { type: 'p', text: 'The Obsidian brief was unusual. Most performance briefs begin with metrics: weight targets, energy return thresholds, stack height parameters. The Obsidian brief began with a question: "What does stillness look like when it\'s moving?"' },
            { type: 'p', text: "It's a poetic brief, and I won't pretend it was immediately useful. But it was generative. It pushed us toward an aesthetic of economy — nothing on the surface that doesn't earn its presence. Every line a load-bearing line. Every material making an argument for itself." },
            { type: 'quote', text: '"What does stillness look like when it\'s moving?" That question drove three years of work.', attribution: 'Sofia Guerra, Creative Director' },
            { type: 'h2', text: 'Seven Prototypes' },
            { type: 'p', text: 'Prototype 2 was too aggressive. P3 was too quiet. P4 was, briefly, our favorite — until we wore it for a week and found it had no longevity as a visual object; it stopped revealing itself after day three. P5 introduced the tooled outsole geometry that survived to production. P6 got the upper right but the midsole wrong. P7 was the conversation between P5 and P6.' },
            { type: 'p', text: 'P7 became the Obsidian Pro. We changed nothing significant between P7 and production. When a design is ready, you know it the same way you know a sentence is done: any more words would be words too many.' },
        ],
    },
    {
        id: 7, category: 'CULTURE', accent: '#A78BFA',
        title: 'Why Sneaker Collecting Is the New Fine Art',
        author: 'ELENA VASQUEZ', authorRole: 'Features Writer', date: 'DEC 28, 2024', readTime: '6 MIN',
        cover: coverImg('1542291026-7eec264c27ff', 800, 500),
        excerpt: 'Auction houses are selling deadstock pairs for six figures. Collectors are applying museum conservation techniques. The line between wearable and art object has never been blurrier.',
        body: [
            { type: 'lead', text: 'In 2023, a pair of 1985 Air Jordan 1s sold at Sotheby\'s for $560,000. The buyer, a private collector based in Hong Kong, has no intention of wearing them. This is no longer unusual.' },
            { type: 'p', text: 'The sneaker as investment vehicle has been a story for a decade. What\'s newer, and more interesting, is the sneaker as art object — valued not for its resale potential but for its cultural significance, its design language, its ability to carry history in a midsole.' },
            { type: 'h2', text: 'Conservation as Practice' },
            { type: 'p', text: 'Serious collectors are adopting museum-grade conservation practices. Climate-controlled storage. UV-filtering display cases. Nitrogen-flushed vacuum sealing for long-term preservation. The foam in a thirty-year-old sneaker is as fragile as the pigment in a Renaissance painting, and collectors are treating it accordingly.' },
            { type: 'quote', text: 'A sneaker holds time differently than a painting. It holds it in the smell, in the crease patterns, in the oxidation. It\'s biography made material.', attribution: 'Elena Vasquez' },
            { type: 'h2', text: 'What Apex Is Doing About It' },
            { type: 'p', text: 'We\'ve begun archiving a numbered pair from every significant release for the APEX permanent collection. These will be stored at our Tokyo facility and eventually — we hope — displayed publicly. We\'re also publishing detailed material specs for every release: not just for collectors, but for the future conservators who will one day need to restore them.' },
        ],
    },
    {
        id: 8, category: 'PERFORMANCE', accent: '#38BDF8',
        title: 'Training in Altitude: What the Data Says',
        author: 'DR. YUKI TANAKA', authorRole: 'Head of Engineering', date: 'DEC 20, 2024', readTime: '7 MIN',
        cover: coverImg('1606107557195-0e29a4b5b4aa', 800, 500),
        excerpt: 'We sent twelve elite athletes to train in Flagstaff, Colorado at 7,000 feet. The results — and what they mean for shoe design — were unexpected.',
        body: [
            { type: 'lead', text: 'Altitude training is not new science. What\'s new is what happens to the shoe — specifically to the midsole — at reduced atmospheric pressure. We went to find out.' },
            { type: 'p', text: 'At sea level, foam midsoles perform within their designed parameters. At altitude, the physics changes: lower air pressure affects the gas cells within the foam, subtly altering compression behavior and energy return curves. For recreational runners, the difference is imperceptible. For elite athletes competing at tenths-of-second margins, it matters.' },
            { type: 'h2', text: 'The Flagstaff Study' },
            { type: 'p', text: 'Over eight weeks, twelve athletes trained in Flagstaff, Arizona at 2,130 meters elevation. We measured midsole performance data via embedded pressure sensors at five points on the footbed. We took readings at sea level before departure, at altitude during the training block, and at sea level upon return.' },
            { type: 'quote', text: 'The foam doesn\'t fail at altitude. It just becomes a slightly different foam. Understanding that difference is how you design for it.', attribution: 'Dr. Yuki Tanaka' },
            { type: 'h2', text: 'What We Found' },
            { type: 'p', text: 'At altitude, energy return in the heel dropped by 3.2% while forefoot energy return increased by 1.8%. This suggests a biomechanical shift: athletes naturally adopt a more anterior foot strike at altitude, likely as a neuromuscular compensation for the midsole behavior change.' },
            { type: 'p', text: 'The implication for design is clear: altitude-specific midsole tuning is not a luxury for elite athletes. It may be a meaningful performance variable for anyone training above 1,500 meters. Our next generation of trail shoes will include altitude-adaptive foam density zones.' },
        ],
    },
    {
        id: 9, category: 'COMMUNITY', accent: '#F87171',
        title: 'The Women Who Rebuilt APEX\'s Community',
        author: 'PRIYA NAIR', authorRole: 'Community Editor', date: 'DEC 12, 2024', readTime: '5 MIN',
        cover: coverImg('1600185365926-3a2ce3cdb9eb', 800, 500),
        excerpt: 'Four years ago, our community was 78% male. Today it\'s 54% female. This is the story of the people who drove that change.',
        body: [
            { type: 'lead', text: 'In 2020, someone on our community team pulled the demographic data for the APEX Run Club. The number — 78% male — was not surprising. It was a problem.' },
            { type: 'p', text: 'Not a PR problem. Not a target-market problem. A real problem: we were building a community that excluded, by default, more than half the people who run. The question wasn\'t how to market better to women. The question was what we\'d done wrong to exclude them in the first place.' },
            { type: 'h2', text: 'The Listening Tour' },
            { type: 'p', text: 'Our community director, Aiko Yamamoto, spent six months in 2021 doing what she called "a listening tour" — conversations with female runners, both inside and outside the APEX ecosystem. The feedback was consistent: the community wasn\'t hostile. It was just built around male defaults. Event timing that ignored childcare. Communication that assumed fitness-as-performance rather than fitness-as-wellbeing. Photography that featured speed over joy.' },
            { type: 'quote', text: 'The community wasn\'t hostile. It was just built around male defaults — and fixing defaults is harder than fixing hostility.', attribution: 'Aiko Yamamoto, Community Director' },
            { type: 'p', text: 'Changes were practical and immediate: morning run times adjusted, photography guidelines rewritten, chapter leadership actively recruited among women, and — crucially — the metrics by which community health was measured were expanded beyond participation numbers to include belonging scores.' },
            { type: 'p', text: 'The 54% figure is not a goal achieved. It\'s a direction confirmed. We are building for everyone who runs. That work is ongoing and never complete.' },
        ],
    },
    {
        id: 10, category: 'DESIGN', accent: '#94A3B8',
        title: 'Color Theory on the Shoe: A Deep Dive',
        author: 'SOFIA GUERRA', authorRole: 'Creative Director', date: 'DEC 5, 2024', readTime: '8 MIN',
        cover: coverImg('1543508282-6319a3e2621f', 800, 500),
        excerpt: 'Why the wrong color on a midsole can make a shoe feel heavier. How colorways create motion before you move. The science and craft of sneaker color.',
        body: [
            { type: 'lead', text: 'Color on a shoe is not decoration. It is weight, speed, and direction. If you\'ve ever worn a shoe that felt faster than it was, or heavier than it looked, color was doing that to you.' },
            { type: 'p', text: 'The human visual system processes color as physical information before it processes it as aesthetic information. Dark below the foot creates a visual anchor — the shoe feels planted. Light below the foot creates lift — the shoe feels propulsive. This is not metaphor. It is the measurable result of perceptual processing that evolved to help us navigate the physical world.' },
            { type: 'h2', text: 'The Midsole Equation' },
            { type: 'p', text: 'The most impactful color decision on any sneaker is the midsole. Upper colors are visible; midsole color is felt. A white midsole, regardless of the upper, creates a visual "ground plane" that makes the shoe read as elevated. A dark midsole grounds the shoe. A gradient midsole — dark at the heel, light at the toe — creates implied forward motion.' },
            { type: 'quote', text: 'The midsole isn\'t the most visible part of the shoe. It\'s the most important part of the colorway.', attribution: 'Sofia Guerra' },
            { type: 'h2', text: 'How APEX Colors' },
            { type: 'p', text: 'Every APEX colorway starts with a brief word — not a Pantone reference, not an RGB value, but a word. The Phantom X2 in "Slate" began with the word "overcast." The Solar × RENZO began with "aperture." We use the word to align the creative team before anyone touches a color picker, because a Pantone reference tells you what color to use and a word tells you why.' },
            { type: 'p', text: 'Then we fight about it. Productively. The color development process at APEX involves at least four rounds of physical samples because digital color lies. Screen phosphors lie. What matters is what happens to the color under a cloudy sky at 7am, and under fluorescent gym lighting at 9pm, and under the warm tungsten of a gallery at midnight. A colorway that works in all three contexts is a colorway worth making.' },
        ],
    },
    {
        id: 11, category: 'CULTURE', accent: '#FF6B35',
        title: 'The Return of the Chunky Sole: A Cultural History',
        author: 'JAMES OKAFOR', authorRole: 'Culture Editor', date: 'NOV 28, 2024', readTime: '5 MIN',
        cover: coverImg('1542291026-7eec264c27ff', 800, 500),
        excerpt: 'Dad shoes. Ugly sneakers. Whatever you called them, they won. Here\'s why the thick sole keeps returning — and what it means each time.',
        body: [
            { type: 'lead', text: 'The first time the thick sole came back, we called it ironic. The second time, we called it a trend. The third time, we started to understand: it was never ironic. It was always a statement about what we wanted our bodies to mean.' },
            { type: 'p', text: 'The chunky sole has a specific cultural logic. It appears when minimalism has exhausted itself — when the clean line and the subtle palette have been absorbed into the mainstream and lost their edge. The thick sole is the aesthetic corrective to austerity. It says: too much is the right amount, at least for now.' },
            { type: 'h2', text: 'The 90s: When the Sole Became Architecture' },
            { type: 'p', text: 'The first major era of thick soles — the Buffalo platform, the Skechers dad shoe, the early FILA basketball silhouettes — arrived in the late 1990s as a response to the slick minimalism of the early decade. It was not subtle. Soles were two inches high. The shoe announced its own presence before you entered a room.' },
            { type: 'quote', text: 'The thick sole is the aesthetic corrective to austerity. It says: too much is the right amount, at least for now.', attribution: 'James Okafor' },
            { type: 'p', text: 'The current chunky era is different from its predecessors because it has performance credentials. The thick sole is no longer purely aesthetic — it houses carbon plates, multi-density foam stacks, and energy-return systems that genuinely work. The visual excess has functional backing. This is new, and it changes the cultural meaning: we\'re not being ironic about excess. We\'ve found out that excess works.' },
        ],
    },
    {
        id: 12, category: 'SUSTAINABILITY', accent: '#34D399',
        title: 'Ocean Plastic and the Shoe: Reality vs. Marketing',
        author: 'AMARA DIALLO', authorRole: 'Sustainability Director', date: 'NOV 20, 2024', readTime: '6 MIN',
        cover: coverImg('1543508282-6319a3e2621f', 800, 500),
        excerpt: 'Brands are racing to put "made from ocean plastic" on the label. Here\'s what that actually means — and what it doesn\'t.',
        body: [
            { type: 'lead', text: 'Let me tell you what "made from ocean plastic" means when a shoe company says it. Then let me tell you what it should mean. The distance between those two things is where this industry currently lives.' },
            { type: 'p', text: 'The most common implementation: brands purchase a certified quantity of plastic waste collected from coastal areas (not necessarily the ocean itself, but within 50km of a waterway). This plastic is processed by a third-party supplier, converted into recycled polyester fiber, and then used to create a portion — sometimes as little as 10% — of the upper material. The shoe then carries the "ocean plastic" label.' },
            { type: 'h2', text: 'Is This Meaningful?' },
            { type: 'p', text: 'Yes, with caveats. Coastal plastic collection is legitimate environmental work. Recycled polyester is meaningfully better than virgin polyester. The problem is the communication: "made from ocean plastic" implies a transformation of scale that the actual quantity doesn\'t deliver.' },
            { type: 'quote', text: 'The question isn\'t whether ocean plastic in shoes is good. It is. The question is whether it\'s being presented honestly.', attribution: 'Amara Diallo' },
            { type: 'h2', text: 'What We Do Differently' },
            { type: 'p', text: 'APEX publishes the exact percentage of recycled content per SKU on our website, alongside the source and processing chain. We don\'t use "ocean plastic" as a marketing term because it overstates what any single product can accomplish. What we say instead: "26% recycled ocean-proximate plastic content — here is the collector, here is the processor, here is where it goes in the shoe." Less poetic. More honest.' },
        ],
    },
    {
        id: 13, category: 'PERFORMANCE', accent: '#38BDF8',
        title: 'The Biomechanics of the Perfect Toe-Off',
        author: 'DR. YUKI TANAKA', authorRole: 'Head of Engineering', date: 'NOV 12, 2024', readTime: '7 MIN',
        cover: coverImg('1606107557195-0e29a4b5b4aa', 800, 500),
        excerpt: 'Every great running shoe is designed around one moment: the toe-off. Here\'s the science of optimizing that 0.12-second window.',
        body: [
            { type: 'lead', text: 'The toe-off phase of a running stride lasts approximately 120 milliseconds. In that window, the shoe must do more mechanical work than in any other phase of the gait cycle. Everything else is preparation.' },
            { type: 'p', text: 'Toe-off begins when the heel leaves the ground and ends when the toes leave the ground. During this phase, the gastrocnemius and soleus muscles of the calf generate the propulsive force that drives the body forward. The shoe\'s job is to support, amplify, and direct that force without adding weight or creating instability.' },
            { type: 'h2', text: 'Three Design Variables' },
            { type: 'p', text: 'The toe-off is shaped by three design variables: stack height at the forefoot, the longitudinal bending stiffness of the midsole, and the rocker geometry of the outsole. Get all three right and the shoe feels like it\'s running for you. Get any one wrong and you feel it, even if you can\'t name it — a subtle resistance, a micro-inefficiency, a shoe that fights its own function.' },
            { type: 'quote', text: 'A perfectly tuned toe-off geometry means the shoe is 0.12 seconds your partner. That doesn\'t sound like much. Over 40,000 strides in a marathon, it\'s everything.', attribution: 'Dr. Yuki Tanaka' },
            { type: 'p', text: 'APEX\'s current generation uses what we call a "progressive rocker" — a curve that is shallower at heel-strike and more aggressive at toe-off. The shoe self-adjusts, in a sense, to the phase of the gait it\'s currently supporting. It\'s a passive system, but it works actively.' },
        ],
    },
    {
        id: 14, category: 'STYLE', accent: '#FBBF24',
        title: 'The Monochrome Moment: Dressing One Color Head to Toe',
        author: 'MIKO CHEN', authorRole: 'Style Editor', date: 'NOV 5, 2024', readTime: '4 MIN',
        cover: coverImg('1608231387042-66d1773d3028', 800, 500),
        excerpt: 'All black. All white. All camel. The case for the single-color outfit — and which APEX silhouettes make it work best.',
        body: [
            { type: 'lead', text: 'The hardest thing to do in getting dressed is to do less. The monochrome outfit — the commitment to one color, one family, one visual note — feels like restraint but operates like amplification.' },
            { type: 'p', text: 'When you wear all black, no single element of your outfit competes with any other. The texture becomes the design. The silhouette becomes the statement. And when all of that is built on the right shoe, the whole thing elevates.' },
            { type: 'h2', text: 'The All-Black Build' },
            { type: 'p', text: 'Start with the Obsidian × VALE in its signature black-on-black colorway. The gold detailing is low enough to read as a whisper, not a statement. Build up: relaxed black trousers with a slight break at the ankle. A black raw-hem tee, medium weight. A black overshirt, worn open. The shoe does the work at the base; the layering creates the architecture above.' },
            { type: 'quote', text: 'When you wear all black, no single element competes. The texture becomes the design. The silhouette becomes the statement.', attribution: 'Miko Chen' },
            { type: 'h2', text: 'The All-White Challenge' },
            { type: 'p', text: 'All white is harder than all black because dirt exists. But worn correctly — with intention, worn-in rather than pristine — all white is the most powerful statement in the monochrome vocabulary. The Ember × KOTO in white, white canvas trousers, a white linen overshirt: this is the look that stops people who claim not to notice clothes.' },
        ],
    },
    {
        id: 15, category: 'DESIGN', accent: '#94A3B8',
        title: 'When Less Is More: The Philosophy of the Apex Blank',
        author: 'SOFIA GUERRA', authorRole: 'Creative Director', date: 'OCT 28, 2024', readTime: '6 MIN',
        cover: coverImg('1595950653106-6c9ebd614d3a', 800, 500),
        excerpt: 'We made a shoe with no logo, no colorway, no story. Just a shoe. Here\'s what we learned from the exercise.',
        body: [
            { type: 'lead', text: 'Every year, we run a design exercise we call The Blank. We strip a silhouette of every piece of branding, every color decision, every material call that exists for aesthetic rather than functional reasons. Then we look at what\'s left.' },
            { type: 'p', text: 'What\'s left is usually honest. The Blank tells us where we\'ve been relying on signature elements to do work that the underlying design should be doing. It tells us which details are earned and which are habitual. It is, consistently, the most useful design review we run.' },
            { type: 'h2', text: 'The Phantom X2 Blank' },
            { type: 'p', text: 'This year\'s Blank exercise used the Phantom X2 platform. We removed the lateral APEX wordmark, neutralized the midsole to a flat medium grey, standardized the laces to white flat, and removed the heel pull tab. What we found surprised us: the shoe is stronger without the wordmark. The lateral profile has enough visual information — the rocker geometry, the midsole seam, the upper panel structure — that it identifies itself.' },
            { type: 'quote', text: 'The Blank exercise tells you where you\'ve been relying on signature elements to do work that the underlying design should be doing.', attribution: 'Sofia Guerra' },
            { type: 'h2', text: 'What We Changed' },
            { type: 'p', text: 'As a result of the Blank exercise, the Phantom X2 production version carries a significantly smaller wordmark — moved from lateral to insole-only on two of the four colorways. It\'s a decision that made our marketing team uncomfortable and our design team certain. The shoe knows who it is without being told. That\'s the goal, always.' },
        ],
    },
];

const CATS = ['ALL', 'CULTURE', 'PERFORMANCE', 'SUSTAINABILITY', 'STYLE', 'COMMUNITY', 'DESIGN'];

// ── Scroll progress bar ────────────────────────────────────────
function ScrollProgress({ accent }) {
    const [prog, setProg] = useState(0);
    useEffect(() => {
        const fn = () => {
            const el = document.documentElement;
            const pct = el.scrollTop / (el.scrollHeight - el.clientHeight);
            setProg(Math.min(1, Math.max(0, pct)));
        };
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);
    return (
        <div style={{ position: 'fixed', top: 64, left: 0, right: 0, height: 3, zIndex: 200, background: 'rgba(255,255,255,0.06)' }}>
            <div style={{ height: '100%', width: `${prog * 100}%`, background: accent, transition: 'width 0.1s linear', boxShadow: `0 0 10px ${accent}88` }} />
        </div>
    );
}

// ── Article reader page ────────────────────────────────────────
function ArticleReader({ story, onBack }) {
    const { isMobile } = useBreakpoint();
    const [entered, setEntered] = useState(false);
    const topRef = useRef(null);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        requestAnimationFrame(() => setEntered(true));
    }, []);

    const px = isMobile ? 24 : 48;

    return (
        <div style={{ background: '#080808', minHeight: '100vh' }}>
            <ScrollProgress accent={story.accent} />

            {/* Back button */}
            <div ref={topRef} style={{ position: 'sticky', top: 64, zIndex: 100, background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 0' }}>
                <div style={{ maxWidth: 800, margin: '0 auto', padding: `0 ${px}px` }}>
                    <button onClick={onBack}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', padding: 0, transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'white'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                        ALL STORIES
                    </button>
                </div>
            </div>

            {/* Hero */}
            <div style={{ maxWidth: 800, margin: '0 auto', padding: `${isMobile ? 40 : 60}px ${px}px 0`, opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(20px)', transition: 'opacity 0.5s, transform 0.5s cubic-bezier(0.23,1,0.32,1)' }}>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, background: `${story.accent}14`, border: `1px solid ${story.accent}44`, padding: '5px 12px' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: story.accent }} />
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.22em', color: story.accent }}>{story.category}</span>
                </div>

                <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 'clamp(36px,9vw,52px)' : 'clamp(44px,5vw,72px)', color: 'white', lineHeight: 1.0, letterSpacing: '0.02em', marginBottom: 24 }}>
                    {story.title}
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36, paddingBottom: 28, borderBottom: `1px solid rgba(255,255,255,0.07)`, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${story.accent}33, ${story.accent}11)`, border: `1px solid ${story.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: story.accent }}>{story.author.split(' ').map(w => w[0]).join('').slice(0, 2)}</span>
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', color: 'white' }}>{story.author}</div>
                            <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{story.authorRole}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginLeft: 'auto' }}>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)' }}>{story.date}</span>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', color: story.accent }}>{story.readTime} READ</span>
                    </div>
                </div>

                {/* Cover image */}
                <div style={{ borderRadius: 3, overflow: 'hidden', marginBottom: 44, aspectRatio: '16/9', background: '#111' }}>
                    <img src={story.cover} alt={story.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            </div>

            {/* Article body */}
            <div style={{ maxWidth: 800, margin: '0 auto', padding: `0 ${px}px ${isMobile ? 64 : 100}px`, opacity: entered ? 1 : 0, transition: 'opacity 0.5s 0.15s' }}>
                {story.body.map((block, i) => {
                    if (block.type === 'lead') return (
                        <p key={i} style={{ fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 19 : 22, color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, marginBottom: 32, fontWeight: 500 }}>{block.text}</p>
                    );
                    if (block.type === 'p') return (
                        <p key={i} style={{ fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 17 : 19, color: 'rgba(255,255,255,0.62)', lineHeight: 1.9, marginBottom: 24 }}>{block.text}</p>
                    );
                    if (block.type === 'h2') return (
                        <h2 key={i} style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 26 : 34, color: 'white', letterSpacing: '0.04em', marginTop: 48, marginBottom: 16 }}>{block.text}</h2>
                    );
                    if (block.type === 'quote') return (
                        <blockquote key={i} style={{ borderLeft: `3px solid ${story.accent}`, paddingLeft: 28, margin: '40px 0', background: `${story.accent}07`, padding: '24px 24px 24px 28px', borderRadius: '0 3px 3px 0' }}>
                            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 19 : 22, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: block.attribution ? 14 : 0 }}>"{block.text}"</p>
                            {block.attribution && <cite style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.16em', color: story.accent, fontStyle: 'normal' }}>— {block.attribution}</cite>}
                        </blockquote>
                    );
                    return null;
                })}

                {/* Footer */}
                <div style={{ marginTop: 64, paddingTop: 36, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <button onClick={onBack}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 28px', background: 'transparent', border: `1px solid ${story.accent}44`, color: story.accent, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${story.accent}12`; e.currentTarget.style.borderColor = story.accent; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${story.accent}44`; }}>
                        ← BACK TO ALL STORIES
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Story card ─────────────────────────────────────────────────
function StoryCard({ story, inView, delay, onRead }) {
    const [hovered, setHovered] = useState(false);
    const { isMobile } = useBreakpoint();

    return (
        <div className={`reveal${inView ? ' revealed' : ''}`}
            style={{ transitionDelay: `${delay}ms`, background: '#0f0f0f', border: `1px solid ${hovered ? story.accent + '44' : 'rgba(255,255,255,0.05)'}`, borderRadius: 3, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.3s, transform 0.4s cubic-bezier(0.23,1,0.32,1)', transform: hovered ? 'translateY(-6px)' : 'none' }}
            onClick={() => onRead(story)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}>

            {/* Cover */}
            <div style={{ height: isMobile ? 175 : 210, overflow: 'hidden', position: 'relative' }}>
                <img src={story.cover} alt={story.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.65s cubic-bezier(0.23,1,0.32,1)', transform: hovered ? 'scale(1.07)' : 'scale(1)' }} />
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, #0f0f0f 0%, transparent 55%)`, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 70%, ${story.accent}1a, transparent 55%)`, opacity: hovered ? 1 : 0.4, transition: 'opacity 0.4s', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 12, left: 12, background: story.accent, padding: '4px 10px' }}>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 8, letterSpacing: '0.18em', color: '#000' }}>{story.category}</span>
                </div>
                <div style={{ position: 'absolute', bottom: 12, right: 12, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.14em', color: story.accent, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', padding: '3px 8px' }}>{story.readTime} READ</div>
            </div>

            {/* Content */}
            <div style={{ padding: isMobile ? '16px 16px 20px' : '20px 22px 24px' }}>
                <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 17 : 21, color: 'white', lineHeight: 1.08, letterSpacing: '0.03em', marginBottom: 10 }}>{story.title}</h3>
                <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 12 : 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, marginBottom: 16 }}>{story.excerpt}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)' }}>{story.author}</div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>{story.date}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: story.accent, opacity: hovered ? 1 : 0.6, transition: 'opacity 0.3s, transform 0.3s', transform: hovered ? 'translateX(3px)' : 'none' }}>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.16em' }}>READ →</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Featured story (big card) ──────────────────────────────────
function FeaturedStory({ story, inView, onRead }) {
    const [hovered, setHovered] = useState(false);
    const { isMobile } = useBreakpoint();

    return (
        <div className={`reveal${inView ? ' revealed' : ''}`}
            style={{ background: '#0f0f0f', border: `1px solid ${hovered ? story.accent + '44' : 'rgba(255,255,255,0.05)'}`, borderRadius: 3, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.3s', display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 340 }}
            onClick={() => onRead(story)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}>
            <div style={{ height: isMobile ? 220 : 'auto', overflow: 'hidden', position: 'relative' }}>
                <img src={story.cover} alt={story.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.65s cubic-bezier(0.23,1,0.32,1)', transform: hovered ? 'scale(1.06)' : 'scale(1)' }} />
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 40% 60%, ${story.accent}20, transparent 55%)`, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 16, left: 16, background: story.accent, padding: '5px 12px' }}>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.18em', color: '#000' }}>{story.category} · FEATURED</span>
                </div>
            </div>
            <div style={{ padding: isMobile ? '24px' : '36px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.22em', color: story.accent, marginBottom: 14 }}>EDITOR'S PICK</div>
                <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 26 : 38, color: 'white', lineHeight: 1.0, letterSpacing: '0.03em', marginBottom: 14 }}>{story.title}</h3>
                <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 13 : 15, color: 'rgba(255,255,255,0.48)', lineHeight: 1.8, marginBottom: 24 }}>{story.excerpt}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em' }}>{story.author}</div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>{story.date} · {story.readTime} READ</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: story.accent, transition: 'opacity 0.2s', opacity: hovered ? 1 : 0.8 }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.16em', color: '#000' }}>READ NOW →</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────────
export default function StoriesPage() {
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [openStory, setOpenStory] = useState(null);
    const [heroRef, heroInView] = useInView(0.1);
    const [gridRef, gridInView] = useInView(0.04);
    const { isMobile, isTablet } = useBreakpoint();
    const px = isMobile ? 20 : isTablet ? 32 : 56;
    const cols = isMobile ? 1 : isTablet ? 2 : 3;

    const filtered = activeFilter === 'ALL' ? STORIES : STORIES.filter(s => s.category === activeFilter);
    const featured = filtered[0];
    const rest = filtered.slice(1);

    // Restore scroll when closing article
    useEffect(() => {
        if (!openStory) window.scrollTo({ top: 0, behavior: 'instant' });
    }, [openStory]);

    if (openStory) {
        return <ArticleReader story={openStory} onBack={() => setOpenStory(null)} />;
    }

    return (
        <div style={{ paddingTop: 64, background: '#080808' }}>

            {/* ── HERO ─────────────────────────────────── */}
            <section ref={heroRef} style={{ minHeight: isMobile ? '45vh' : '58vh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                {/* Background texture */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,34,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,34,0,0.025) 1px,transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '10%', right: '8%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(255,34,0,0.06) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '5%', left: '15%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

                <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%', padding: `80px ${px}px ${isMobile ? 44 : 60}px`, position: 'relative', zIndex: 1 }}>
                    <div className={`reveal${heroInView ? ' revealed' : ''}`} style={{ marginBottom: 12 }}>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.36em', color: 'var(--red)', background: 'rgba(255,34,0,0.08)', border: '1px solid rgba(255,34,0,0.2)', padding: '4px 14px' }}>CULTURE &amp; EDITORIAL</span>
                    </div>
                    <h1 className={`reveal${heroInView ? ' revealed' : ''}`} style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 'clamp(52px,14vw,80px)' : 'clamp(72px,9vw,130px)', color: 'white', lineHeight: 0.88, letterSpacing: '0.02em', marginBottom: 18, transitionDelay: '80ms' }}>
                        STORIES<br /><span style={{ color: 'var(--red)' }}>WORTH</span><br /><span style={{ WebkitTextStroke: '1px rgba(255,255,255,0.25)', color: 'transparent' }}>TELLING.</span>
                    </h1>
                    <p className={`reveal${heroInView ? ' revealed' : ''}`} style={{ transitionDelay: '160ms', fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 13 : 15, color: 'rgba(255,255,255,0.38)', maxWidth: 460, lineHeight: 1.85 }}>
                        Long reads on culture, performance science, sustainability, and the people building the future of sneakers. Pull up a chair.
                    </p>
                </div>
            </section>

            {/* ── FILTER BAR ───────────────────────────── */}
            <div style={{ background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 64, zIndex: 50 }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', padding: `0 ${px}px`, display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {CATS.map(cat => (
                        <button key={cat} onClick={() => setActiveFilter(cat)}
                            style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: isMobile ? 10 : 11, letterSpacing: '0.2em', padding: isMobile ? '14px 14px' : '16px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${activeFilter === cat ? 'var(--red)' : 'transparent'}`, color: activeFilter === cat ? 'white' : 'rgba(255,255,255,0.32)', cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── CONTENT ──────────────────────────────── */}
            <section ref={gridRef} style={{ background: '#080808', padding: `${isMobile ? 48 : 64}px ${px}px ${isMobile ? 72 : 120}px` }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>

                    {/* Featured */}
                    {featured && (
                        <div style={{ marginBottom: isMobile ? 32 : 48 }}>
                            <FeaturedStory story={featured} inView={gridInView} onRead={setOpenStory} />
                        </div>
                    )}

                    {/* Grid */}
                    {rest.length > 0 && (
                        <>
                            <div className={`reveal${gridInView ? ' revealed' : ''}`} style={{ transitionDelay: '200ms', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28, flexWrap: 'wrap', gap: 8 }}>
                                <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 26 : 36, color: 'white', letterSpacing: '0.03em' }}>MORE STORIES</h2>
                                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.28)' }}>{filtered.length} ARTICLES</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: isMobile ? 16 : 24 }}>
                                {rest.map((s, i) => (
                                    <StoryCard key={s.id} story={s} inView={gridInView} delay={i * 80} onRead={setOpenStory} />
                                ))}
                            </div>
                        </>
                    )}

                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: 'rgba(255,255,255,0.2)', marginBottom: 12 }}>NO STORIES FOUND</div>
                            <button onClick={() => setActiveFilter('ALL')} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.18em', padding: '10px 24px', background: 'var(--red)', border: 'none', color: 'white', cursor: 'pointer' }}>SHOW ALL</button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}