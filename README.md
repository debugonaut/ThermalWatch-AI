# ThermalWatch AI

### Context-aware satellite thermal intelligence for India

> Smart India Hackathon 2026 · Industrial thermal anomaly classification and geospatial monitoring

[![Live prototype](https://img.shields.io/badge/Live%20prototype-sih26ekaant.web.app-2563eb?style=flat-square)](https://sih26ekaant.web.app)
[![Project status](https://img.shields.io/badge/Status-Research%20prototype-f59e0b?style=flat-square)](#project-status)
[![Data policy](https://img.shields.io/badge/Data%20policy-No%20synthetic%20fallbacks-16a34a?style=flat-square)](#scientific-data-integrity)
[![License](https://img.shields.io/badge/License-MIT-111827?style=flat-square)](LICENSE)

ThermalWatch AI is a proposed Pan-India decision-support system for detecting, classifying, explaining and monitoring satellite-observed thermal anomalies. It is designed for the central difficulty of the SIH problem statement: a thermal pixel shows that heat was detected, but it does not by itself establish whether the source is a wildfire, agricultural burning, an industrial process, a gas flare or an industrial accident.

The final system will combine thermal observations, land cover, terrain, facility context, temporal persistence, geostationary monitoring, optical imagery and delayed atmospheric products. It will issue one operational class for every eligible detection while preserving the distinction between an authority-verified event and a context-supported hypothesis.

> [!IMPORTANT]
> This repository currently contains the interactive geospatial dashboard and visualization assets. The evidence-graded labelling registry, progressive live-inference services and newly trained model artifacts described below are the target architecture and are still being integrated. Existing visualization labels must not be interpreted as independently verified causes.

No model-performance scores are reported in this README. They will be published only after the new evidence contract, isolated holdout and final training pipeline have been completed and audited.

---

## Table of contents

1. [Problem statement](#problem-statement)
2. [What the final project will do](#what-the-final-project-will-do)
3. [Five operational classes](#five-operational-classes)
4. [Evidence contract](#evidence-contract)
5. [End-to-end architecture](#end-to-end-architecture)
6. [Progressive live inference](#progressive-live-inference)
7. [Data sources and roles](#data-sources-and-roles)
8. [Context-aware labelling](#context-aware-labelling)
9. [Training and data separation](#training-and-data-separation)
10. [Evaluation contract](#evaluation-contract)
11. [Dashboard and GIS experience](#dashboard-and-gis-experience)
12. [Scientific data integrity](#scientific-data-integrity)
13. [Project status](#project-status)
14. [Repository structure](#repository-structure)
15. [Local development](#local-development)
16. [Limitations](#limitations)
17. [Roadmap](#roadmap)

---

## Problem statement

Industrial facilities produce thermal signatures that can be detected from space. The same is true for wildfires, agricultural residue burning and other natural or human-caused heat sources. NASA FIRMS is extremely useful for locating thermal anomalies, but a FIRMS detection is not a causal label.

The project therefore addresses two connected problems:

1. **Classification ambiguity** — multiple sources can produce similar brightness-temperature and Fire Radiative Power observations.
2. **Asynchronous evidence** — relevant sensors and contextual datasets do not arrive at the same time.

A useful operational system must not wait several days before showing anything, but it must also not pretend that the first available thermal observation contains evidence that has not arrived yet. ThermalWatch AI is designed to make an early, explicitly qualified assessment and revise it as additional evidence becomes available.

The system is intended to support:

- segregation of industrial thermal activity from forest and other natural fires;
- identification of persistent industrial heat and routine gas flaring;
- review of unusual thermal events near industrial infrastructure;
- Pan-India storage, filtering and temporal monitoring;
- GIS overlays for thermal detections, facilities, land cover and imagery;
- reproducible explanations for every displayed classification.

It is a decision-support system. It does not replace emergency services, plant operators, forest departments or other competent authorities.

---

## What the final project will do

For every eligible thermal detection, the final workflow will:

```text
Receive a genuine thermal observation
        -> validate provenance, units, time and geography
        -> attach the context available at that moment
        -> evaluate versioned evidence signals
        -> assign one operational class
        -> attach an evidence grade and structured trace
        -> display the result on the GIS dashboard
        -> revise the assessment when delayed evidence arrives
        -> preserve every stage for audit and comparison
```

The system will never silently manufacture a missing input. If a sensor has not observed a location, is delayed, is outside its physical coverage or fails a quality check, the corresponding value remains unavailable and the trace records why.

### Design principles

- **Heat detection is not cause attribution.**
- **One displayed class does not imply equal evidence for every row.**
- **Missing data remains missing.**
- **Every quantitative rule is versioned and traceable to an admissible source.**
- **Official incident evidence is kept separate from contextual evidence.**
- **Live predictions can mature as new observations arrive.**
- **Model retraining occurs only from audited label batches, not from unlabelled API traffic.**

---

## Five operational classes

Every eligible detection will receive exactly one of the following operational classes:

| Class | Operational meaning | Important boundary |
|---|---|---|
| **Wildfire** | A thermal event whose available evidence is most consistent with burning in forest or other wildland context | Forest location alone does not prove natural ignition |
| **Agricultural Burning** | A thermal event whose available evidence is most consistent with crop-residue or field burning | Cropland and season are contextual signals, not incident verification |
| **Industrial Persistent Heat** | Recurring or sustained heat associated with industrial infrastructure or operations | Facility proximity alone does not prove the facility caused the detection |
| **Routine Gas Flare** | Persistent combustion consistent with a known or independently supported flare source | Persistence alone cannot establish a gas flare without compatible source evidence |
| **Suspected Industrial Accident** | An unusual, non-routine thermal event near industrial infrastructure that requires urgent human review | This is an alerting hypothesis, not an automatic declaration that an accident occurred |

The word **suspected** is part of the industrial-accident class contract. Only an official incident record or equivalent external authority evidence may upgrade a cause from a hypothesis to an asserted event.

---

## Evidence contract

The final system separates the required operational class from the strength of evidence behind it.

| Evidence grade | Meaning | Permitted interpretation |
|---|---|---|
| `G_ASSERTED` | A compatible official record matches the observation under the declared spatial and temporal rule | Cause asserted by evidence external to the classification rules |
| `G_CORROBORATED` | Two or more independent signal families support the same class without a blocking conflict | Supported operational hypothesis |
| `G_SINGLE_FAMILY` | One signal family supports the selected class | Weak operational hypothesis |
| `G_CONTEXT_ONLY` | The class is selected from contextual evidence only | Context-backed display classification requiring caution |
| `G_CONFLICT` | Available signals disagree | Best-supported class shown with mandatory analyst review |

Only `G_ASSERTED` may be described in the application as verified. Every other grade remains a hypothesis even though the interface must assign one of the five classes.

### Evidence trace

Each prediction record is designed to carry:

- detection identifier and source product;
- observation time and geometry;
- prediction stage;
- features genuinely available at that stage;
- selected operational class;
- evidence grade;
- signal families that fired;
- source values read by each signal;
- citation and version of each signal;
- abstained signals and machine-readable reasons;
- conflicting signals;
- superseded prediction stage, when applicable.

The dashboard explanation will be rendered from these structured fields. It will not generate a persuasive story after the classification has already been made.

---

## End-to-end architecture

```text
Official and agency data sources
        |
        v
Acquisition receipts + immutable hashes
        |
        v
Unit, geometry, timestamp and quality gates
        |
        +------------------------+
        |                        |
        v                        v
Historical 2024 corpus      Live observation streams
        |                        |
        v                        v
Evidence-aware labels       Feature-availability ladder
        |                        |
        v                        v
Spatial/temporal split      Stage-specific inference
        |                        |
        v                        v
Audited model training      Revised prediction records
        |                        |
        +------------+-----------+
                     |
                     v
          Versioned geospatial store
                     |
                     v
       MapLibre dashboard + evidence inspector
```

### Logical units

1. **Acquisition layer** — retrieves original files or API responses and records provenance.
2. **Integrity layer** — validates hashes, units, coverage, coordinates, physical bounds and source identity.
3. **Context layer** — joins only compatible land-cover, terrain, facility, imagery and atmospheric observations.
4. **Labelling registry** — executes transparent, versioned evidence signals and produces a trace.
5. **Training pipeline** — builds isolated train and holdout sets after all integrity gates pass.
6. **Progressive inference service** — emits and later revises predictions as features become available.
7. **Geospatial store** — retains observation, prediction-stage and provenance records without overwriting history.
8. **Analyst interface** — displays detections, classes, evidence grades, source freshness and supporting context.

---

## Progressive live inference

The system does not assume that all datasets arrive together. A prediction is emitted at each eligible stage and is tagged with the exact evidence available at that time.

| Stage | Typical availability | Intended evidence | Behaviour |
|---|---|---|---|
| `S0_STATIC_CONTEXT` | Before an event | Terrain, land cover, sovereign boundary, facility and registry context | Pre-computed context; never treated as proof of an active fire |
| `S1_GEOSTATIONARY` | Minutes to tens of minutes where physically covered | INSAT or Himawari thermal monitoring and short-term evolution | Early thermal screening with explicit resolution and coverage limits |
| `S2_POLAR_DETECTION` | After a compatible overpass and product publication | FIRMS/VIIRS brightness, FRP and quality fields | Coordinate-accurate polar thermal detection and primary tabular inference |
| `S3_PERSISTENCE` | After repeated observations | Multi-pass, multi-day or multi-night recurrence | Distinguishes persistent heat from new or changing behaviour |
| `S4_GASES_REANALYSIS` | Later, product-dependent | Compatible NO2, SO2, aerosol, weather or reanalysis context | Delayed corroboration; never backfilled with proxy conversions |

### Coverage is part of the prediction

- INSAT cadence and spatial resolution are reported as supplied by the source product.
- Himawari can provide faster observations in its valid field of view, but its western-India blind region is never filled by extrapolation.
- A coarse sensor failing to detect a small fire is not negative evidence.
- TROPOMI and reanalysis products may arrive later and must not be presented as real-time thermal observations.
- Every stage lists `features_available` so later predictions can be compared with earlier ones.

### Progressive inference is not uncontrolled retraining

Incoming live data updates the evidence attached to an event. It does not automatically become a training label.

```text
New sensor observation
        -> update or revise the event prediction
        -> store the new stage and retain the old stage
        -> do not change model parameters

New audited labelled batch
        -> pass provenance and leakage gates
        -> evaluate distribution and unit compatibility
        -> approve a versioned training update
        -> retrain or increment the eligible model
```

This prevents the system from learning its own earlier predictions as if they were ground truth.

---

## Data sources and roles

The final system treats every source according to what it can actually establish.

| Source family | Examples | Intended role | Not permitted |
|---|---|---|---|
| Polar thermal detection | NASA FIRMS VIIRS | Thermal location, brightness, FRP and product quality | Declaring cause from a hot pixel alone |
| Indian geostationary monitoring | ISRO MOSDAC INSAT-3D/3DR/3DS products | Shorter-interval thermal evolution over supported coverage | Inventing finer spatial detail than the native product |
| East-Asian geostationary monitoring | JAXA Himawari AHI products | High-cadence temporal context where physically visible | Extrapolating into the western blind region |
| Land cover | ESA WorldCover | Static surface context | Treating forest or cropland as proof of fire cause |
| Terrain | NASA SRTM | Elevation and topographic context | Replacing missing raster cells with formulas |
| Optical imagery | Copernicus Sentinel-2 L2A | Human-review and vision-model context from authentic scenes | Procedurally generated or synthetic image chips |
| Atmospheric observations | Copernicus Sentinel-5P NO2/SO2 products | Delayed plume and industrial-context evidence | Converting ground concentration into satellite column values using assumed parameters |
| Reanalysis and weather | ECMWF/Copernicus products | Wind, humidity and environmental context | Presenting modelled fields as direct satellite measurements |
| Facility and flare context | Government registries and compatible flare products | Known-source context and persistence support | Treating proximity alone as cause attribution |
| Official incident records | Forest, police, disaster or industrial authorities | External verification when time, place and event identity match | Majority-filling classes without an incident record |

Ground monitoring stations may be displayed as separate contextual observations. A city station value will not be broadcast across rural detections or used as a substitute for a missing satellite product.

---

## Context-aware labelling

The 2024 corpus cannot be trained safely from the legacy target column because that target was produced using formulas and proxy assumptions. The replacement design uses a registry of explicit labelling functions.

Every labelling function must declare:

- a stable identifier and version;
- its supported class or abstention purpose;
- the exact source columns it reads;
- the observation level at which it operates;
- its temporal and spatial scope;
- the quantitative claim it encodes;
- the supporting publication or official documentation;
- a page or section locator;
- conditions under which it abstains;
- incompatibilities and known limitations.

### Signal families

The planned registry covers:

- thermal magnitude and sensor-quality gates;
- land-cover context;
- season and local-calendar context;
- elevation and topographic context;
- geostationary temporal behaviour;
- fixed-point recurrence and persistence;
- facility and known-source context;
- atmospheric coincidence;
- official-record matching;
- conflict and insufficient-evidence rules.

No single contextual signal is allowed to masquerade as verified cause. The selected class is produced by a deterministic, documented aggregation contract, and the evidence grade tells the user how much may safely be concluded.

### Circularity and leakage control

If a variable contributes directly to weak-label generation and is also proposed as a model input, the overlap must be handled explicitly. The project must either:

1. remove the variable from the model feature set for that experiment;
2. prevent that signal from voting and retain it only in the evidence trace; or
3. run a separately disclosed sensitivity experiment that does not present self-consistency as external performance.

The label generator, feature contract and training manifest must record the decision. Silent overlap is a build failure.

---

## Training and data separation

### Historical split

The final 2024 dataset will use the requested **80:20 ratio**, but it will not use a random row split.

Nearby pixels from the same incident and repeated observations of the same facility must not appear on both sides of the split. The split therefore combines:

- spatial grouping by geodetic blocks;
- temporal isolation for a declared holdout period;
- incident-level reservation for authority-verified events;
- duplicate and near-duplicate controls;
- an immutable split fingerprint saved with every run.

### Model roles

| Model family | Eligible input | Intended contribution | Activation condition |
|---|---|---|---|
| **XGBoost** | Audited tabular physical and contextual features | Strong baseline for sparse, mixed and missing tabular inputs | Provenance-certified feature matrix and frozen split |
| **1D CNN** | Authentic, time-aligned geostationary sequences | Temporal shape, persistence and change behaviour | Genuine sequences with documented cadence and coverage; no fabricated curves |
| **ResNet** | Authentic, source-identified satellite image chips | Optical surface and infrastructure context | Real imagery with scene provenance, acquisition time and preprocessing manifest |
| **Fusion layer** | Out-of-fold outputs from eligible base models | Stage-aware combination of available modalities | Base-model compatibility, isolated meta-training data and no missing-modality fabrication |

The final system may not have every model available at every live stage. A stage-specific baseline is preferable to inventing an unavailable sequence or image.

### Missing values

- Missing observations remain IEEE missing values or explicit unavailable fields.
- No mean filling, regional broadcasting or synthetic time series is introduced.
- A missing sensor caused by cloud, orbital geometry or delayed publication is recorded as such.
- Models are trained and evaluated for the feature combinations they can genuinely receive in operation.

---

## Evaluation contract

Three different evaluations are kept separate:

| Name | What it measures | How it may be described |
|---|---|---|
| **N1 — Authority-verified external evaluation** | Behaviour on events whose cause is supplied by an independent official record | Primary external evaluation where available |
| **N2 — Grouped weak-label consistency** | Agreement with weak operational labels on a spatially and temporally isolated holdout | Consistency only; never represented as external ground truth |
| **N3 — Signal audit** | Coverage, abstention, conflict and recovery behaviour of each labelling function | Evidence-system diagnostic |

The final report will also include:

- per-class confusion matrices where admissible labels exist;
- per-stage results for `S0` through `S4`;
- feature-availability and missingness summaries;
- geography and season slices;
- conflict and abstention rates;
- sensitivity tests for any feature that overlaps with a labelling signal;
- source-manifest and split fingerprints required to reproduce a run.

No single aggregate value will be allowed to hide the behaviour of rare industrial or emergency classes.

---

## Dashboard and GIS experience

The interface is map-first: the geospatial evidence remains primary, while controls and explanations appear as restrained overlays.

### National view

- Pan-India thermal density through PMTiles and vector hexbins;
- class and physical-parameter colouring;
- time filtering and daily playback;
- source freshness and prediction-stage filters;
- aggregate counts separated by evidence grade.

### District and incident view

- coordinate-level thermal detections;
- observation time, source satellite, brightness and FRP;
- available land-cover, elevation and facility context;
- earlier and later prediction stages for the same event;
- conflicts and unavailable sources.

### Facility-detail view

- automatic zoom to detailed building and road geometry;
- low-contrast building footprints beneath the thermal overlay;
- optional optical/satellite comparison;
- persistent-source history around the selected coordinate;
- facility boundaries and registry context where licensing permits;
- evidence inspector containing class, grade, stage and trace.

### Evidence inspector

The final inspector replaces unsupported legacy scorecards with:

- **Operational class**
- **Evidence grade**
- **Prediction stage**
- **Available sources**
- **Fired signals**
- **Abstained signals and reasons**
- **Conflicts requiring review**
- **Source provenance and timestamps**
- **Previous prediction revisions**

### Demonstration and simulation

Emergency drills and animated spread demonstrations are retained only as clearly marked simulations. They must never be mixed with live detections, historical observations or verified incident records.

---

## Scientific data integrity

ThermalWatch AI follows the rule: **no data is better than contaminated data**.

### Non-negotiable requirements

1. No synthetic satellite rows, image chips, temporal curves or minority-class samples.
2. No mathematical proxy presented under the name of an official sensor product.
3. No city-centroid or monitoring-station value broadcast across Pan-India detections.
4. No rectangular bounding-box substitute for the sovereign India geometry where national coverage is claimed.
5. No merging of incompatible units, sensors, product levels or observation geometries.
6. No hidden fallback when an API, credential, product or coverage region is unavailable.
7. No training run before source, label, feature and split manifests pass their gates.

### Required provenance

Every accepted artifact should record:

- publisher and product name;
- official URL or product identifier;
- retrieval time;
- temporal and geographic coverage;
- file size and cryptographic hash;
- native units and resolution;
- extraction and filtering steps;
- quality flags retained or rejected;
- downstream rows or features derived from it.

### Failure behaviour

If a required source cannot be obtained or validated, the pipeline stops and reports the unresolved dependency. It does not generate substitute values merely to complete a run.

---

## Project status

| Component | Status | Notes |
|---|---|---|
| Full-screen MapLibre GIS dashboard | **Implemented** | Dark/light basemaps, navigation and map-first controls |
| Pan-India PMTiles and GeoJSON rendering | **Implemented** | Historical visualization assets are bundled in the frontend |
| Class and telemetry filtering | **Implemented** | Existing labels are visualization inputs pending replacement |
| Daily 2024 playback | **Implemented** | Bundled day-indexed map assets |
| Optical/thermal comparison | **Implemented as prototype** | Interface capability; imagery provenance must remain explicit |
| Emergency drill interface | **Implemented as simulation** | Must remain visibly separated from observations |
| Evidence library and claim audit | **Completed in development workspace** | Public reproducibility artifacts are to be migrated |
| Evidence-grade schema | **Designed** | UI and storage integration pending |
| Versioned labelling-function registry | **In progress** | Legacy target generation will be replaced |
| Audited 2024 80:20 split | **Planned after label certification** | No model training before the split is frozen |
| Stage-specific model training | **Pending** | Training is run separately after all gates pass |
| Progressive `S0`–`S4` inference | **Designed** | Connectors and revision store pending |
| Authority-record assertion route | **Partially available** | Coverage differs substantially by class and authority |
| Production alert dispatch | **Out of scope for the prototype** | Human review remains mandatory |

---

## Repository structure

```text
ThermalWatch-AI/
├── README.md
├── LICENSE
├── outputs/                         # Small exported visualization artifacts
└── frontend/
    ├── src/
    │   ├── components/              # Map, docks, filters, inspector and simulations
    │   ├── store/                   # Shared application and map state
    │   ├── lib/                     # External-service initialization
    │   └── utils/                   # UI-side utilities
    ├── public/
    │   ├── data/                    # PMTiles, GeoJSON and daily playback assets
    │   └── assets/                  # Static browser assets
    ├── scripts/                     # Visualization-data preparation helpers
    ├── package.json
    └── vite.config.ts
```

The final public structure will add independently testable pipeline packages for acquisition, integrity validation, labelling functions, feature contracts, grouped splitting, stage-aware prediction and evidence-trace storage.

---

## Local development

### Requirements

- Node.js compatible with the version of Vite declared in `frontend/package.json`
- npm
- A modern browser with WebGL support

### Run the dashboard

```bash
git clone https://github.com/debugonaut/ThermalWatch-AI.git
cd ThermalWatch-AI/frontend
npm ci
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite.

### Optional Firebase configuration

The frontend includes optional Firebase/Firestore integration. Populate the `VITE_FIREBASE_*` fields in `frontend/.env` only for a Firebase project you control. Do not commit credentials.

### Validation commands

```bash
cd frontend
npm run lint
npm run build
```

### Data note

The repository includes large static map assets for demonstration. These files are visualization artifacts and are not, by themselves, a certified training release. A final training release must include its own source manifests, label registry version, feature contract and split fingerprint.

---

## Limitations

- Public, incident-level cause records are uneven across classes and regions.
- A satellite thermal anomaly may cover multiple activities within one pixel.
- Cloud, smoke, viewing geometry, product latency and sensor resolution affect availability.
- Static land cover and facility proximity provide context but do not prove what burned.
- Persistent heat can indicate several industrial processes; it is not automatically a gas flare.
- Atmospheric products are delayed and may not be attributable to a single source.
- Himawari coverage is physically limited over western India.
- Optical imagery may be cloud-obscured or temporally separated from the thermal event.
- A forced five-class output is an operational requirement, not a guarantee of verified cause.
- `G_CONTEXT_ONLY` and `G_CONFLICT` outputs require especially cautious interpretation.
- Suspected industrial accidents require analyst and authority confirmation.

---

## Roadmap

```text
Evidence library and admissibility audit
        -> finalise operational signal weights and conflict policy
        -> implement the labelling-function registry
        -> generate evidence-graded 2024 labels
        -> audit coverage, abstentions and conflicts
        -> freeze the spatial-temporal 80:20 split
        -> build stage-specific feature matrices
        -> train eligible XGBoost, 1D-CNN and ResNet models
        -> evaluate N1, N2 and N3 separately
        -> implement progressive prediction revisions
        -> replace legacy dashboard scorecards with evidence traces
        -> add facility-detail building geometry and source freshness
        -> publish reproducibility manifests and limitations
```

The project will be considered ready for scientific presentation when the public dashboard, evidence contract, data manifests, training inputs and displayed claims all describe the same system.

---

## Responsible use

ThermalWatch AI is an academic and competition prototype. Its outputs should be treated as screening and prioritization information. They must not be used as the sole basis for emergency dispatch, regulatory enforcement, criminal attribution or public claims about a facility or individual.

## License

This repository is released under the [MIT License](LICENSE). Third-party satellite products, basemaps and derived data retain their respective licences, attribution requirements and access conditions.
