# AccountIQ | AI Enterprise Account Intelligence Copilot

> **Autonomous Enterprise Storage Account Intelligence Copilot for Enterprise Solutions Engineers (SEs)**  
> Built for Fortune 500 account research, technology footprint investigation, competitor displacement (Dell, Pure Storage, NetApp, HPE), and battlecard synthesis for the IBM Storage portfolio.

---

## 🌟 Overview & Core Value Proposition

Enterprise Sales Engineers (SEs) frequently spend 2–3 hours before executive meetings manually digging through 10-Ks, earnings call transcripts, LinkedIn job boards, and IT vendor surveys. Generic AI chatbots simply summarize the company's website or recite Wikipedia.

**AccountIQ** operates like an elite enterprise technology analyst who also holds a Principal Storage & Cloud Architect certification:
1. **Deduces Real Infrastructure Footprints:** Discovers known SAN/NAS architectures, cloud footprints (AWS, Azure, on-prem OpenShift/VMware), and incumbent vendor estates (Dell PowerMax, Pure Storage FlashArray, NetApp ONTAP).
2. **Spots Timely Buying Signals & Vulnerabilities:** Identifies post-year-3 maintenance cost cliffs, DORA & SEC cyber incident disclosure mandates, I/O starvation on AI GPU clusters, and leadership changes.
3. **Connects to IBM Capabilities:** Maps identified challenges to IBM FlashSystem 9500 with FlashCore Modules 4 (FCM4 inline hardware ransomware detection), IBM Storage Scale (GPUDirect Storage for AI), IBM Storage Defender, and Storage Fusion.
4. **Arming the Solutions Engineer:** Generates 5 sharp discovery questions (with underlying psychology and pivot hooks), 3 interactive solution topologies, peer customer proof points, competitor counter-arguments, and tailored 1-click executive email pitches.

---

## 🧠 Powered by Rork AI

AccountIQ integrates with Rork LLM (`https://toolkit.rork.com/text/llm/`) to perform multi-stage research and synthesis:

```javascript
// Calling Rork LLM Engine
const response = await fetch('https://toolkit.rork.com/text/llm/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages })
});
const data = await response.json();
```

---

## 🏗️ 5-Component Application Architecture

| Component | Technology | Description |
|-----------|------------|-------------|
| **Research Swarm** | Rork LLM (`toolkit.rork.com`) | Multi-agent prompts embodying enterprise storage SE and financial analyst personas. |
| **Domain Knowledge Layer** | TypeScript Knowledge Engine | IBM Storage catalog (FlashSystem, FCM4, Scale, Defender, Fusion, Ceph) + Dell/Pure/NetApp competitor battlecards. |
| **Pipeline Orchestrator** | Node.js / Express + SSE | Server-Sent Events streaming real-time agent execution traces to the browser. |
| **Interactive Dashboard** | React + TypeScript + Tailwind CSS | Dark-mode enterprise UI, 8-section tabbed dossier, interactive topologies, and executive briefing views. |
| **Ask SE Copilot Drawer** | Rork Conversational Agent | Live slide-out Q&A drawer for ad-hoc meeting prep questions and email drafting. |

---

## 📊 Complete 8-Section Intelligence Dossier

1. **Company Strategy:** Major business segments, strategic tech investments, earnings commentary (e.g. Jamie Dimon / Albert Bourla), and enterprise AI roadmaps.
2. **Technology Landscape:** Hybrid cloud footprint, compute/database estates, incumbent vendor vulnerability matrix (Dell, Pure, NetApp), and architectural gaps.
3. **Business Challenges:** 35% YoY data growth, power & cooling constraints, DORA & SEC regulatory mandates, ransomware blast radius, and GPU data loading bottlenecks.
4. **Buying Signals:** CIO/VP Infra leadership appointments, job requisition spikes (NVMe-oF, Kubernetes CSI, GPFS), and datacenter CapEx allocations.
5. **IBM Opportunity Mapping:** Specific product matching, quantified TCO ROI transformation table, competitor takeout playbooks, and strategic wedge questions.
6. **Meeting Preparation & Battlecard:** 5 discovery questions (with strategic intent & listen-for cues), 3 interactive solution topologies, verified customer case studies, and field-tested objection handlers.
7. **Executive Stakeholder Map:** Personas for CIO, VP Infrastructure, CISO, and Head of AI Platforms with 1-click tailored email pitch openers.
8. **Executive Briefing Document:** Formatted markdown dossier with copy-to-clipboard and export options.

---

## 🚀 Getting Started

### 1. Set Active Workspace
Recommend setting the active workspace to this folder:
```bash
/Users/tusharjain/.gemini/antigravity/scratch/account-iq
```

### 2. Run the Development Server
```bash
npm run dev
```
- **Backend API:** `http://localhost:3001`
- **Frontend Dashboard:** `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
```

---

## ⚖️ Legal Disclaimer & Trademark Notice

AccountIQ is an independent analytical tool built for enterprise solutions engineers. It is **not** an official product of, nor is it sponsored, authorized, or endorsed by International Business Machines Corporation (IBM) or any other vendor mentioned herein.

- **IBM**, **FlashSystem**, **DS8000**, **Storage Scale**, **Storage Defender**, **Storage Fusion**, **Storage Ceph**, **IBM Z**, **zSystems**, and other IBM trademarks are registered trademarks of International Business Machines Corporation in the United States and/or other countries.
- **Dell**, **PowerMax**, **PowerStore**, **PowerScale**, **Pure Storage**, **FlashArray**, **FlashBlade**, **Portworx**, **NetApp**, **ONTAP**, **HPE**, and **Alletra** are trademarks of their respective owners.
- All vendor and product references are used strictly for informational, educational, and nominative fair-use comparative purposes.

---

## 🛡️ License
MIT License - Built for Enterprise Solutions Engineering Research.

