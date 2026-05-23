# Built-in Reference Corpus for the EU AI Act & Adjacent Legal Frameworks

CORPUS = [
    {
        "id": "Art_3_1_AI_Def",
        "title": "Article 3(1) - Definition of an AI System",
        "source": "Legislation - EU AI Act",
        "url": "http://data.europa.eu/eli/reg/2024/1689/oj",
        "text": (
            "An 'artificial intelligence system' (AI system) means a machine-based system "
            "designed to operate with varying levels of autonomy, that may exhibit adaptiveness "
            "after deployment and that, for explicit or implicit objectives, infers, from the "
            "input it receives, how to generate outputs such as predictions, content, recommendations, "
            "or decisions that can influence physical or virtual environments."
        ),
        "key_indicators": [
            "Machine-based: Operates on electronic computing hardware.",
            "Autonomy: Can execute tasks without constant manual human steering.",
            "Adaptiveness: Learns or alters its model parameters during/after deployment.",
            "Inference: Converts inputs into predictions, content, decisions, or recommendations via statistical, machine learning, or logical logic (not simple deterministic rule sheets)."
        ]
    },
    {
        "id": "Art_5_Prohibited_Practices",
        "title": "Article 5 - Prohibited Artificial Intelligence Practices",
        "source": "Legislation - EU AI Act",
        "url": "http://data.europa.eu/eli/reg/2024/1689/oj",
        "text": (
            "The following AI practices shall be prohibited:\n"
            "1. Cognitive behavioral manipulation: AI systems that deploy subliminal techniques beyond "
            "human consciousness or purposeful manipulative/deceptive techniques, with the objective or effect of "
            "materially distorting behavior in a manner that causes or is likely to cause significant harm.\n"
            "2. Exploitation of vulnerabilities: AI systems that exploit vulnerabilities of a person or a specific group "
            "due to their age, disability, specific social or economic situation, to distort behavior in a harmful manner.\n"
            "3. Social Scoring: AI systems used by public authorities (or on their behalf) for the evaluation or classification "
            "of natural persons over a period of time based on their social behavior, leading to detrimental or unfavorable "
            "treatment in social contexts unrelated to where the data was collected.\n"
            "4. Biometric Categorization: AI systems that categorize natural persons individually based on their biometric data "
            "to deduce or infer their race, political opinions, trade union membership, religious beliefs, sex life or sexual orientation. "
            "(Exceptions apply to law enforcement under strict judicial warrants).\n"
            "5. Untargeted Scraping: AI systems that create or expand facial recognition databases through the untargeted "
            "scraping of facial images from the internet or CCTV footage.\n"
            "6. Emotion Recognition: AI systems used to detect or infer emotions of natural persons in the areas of "
            "workplace and educational institutions, except where the use is for safety or medical purposes."
        ),
        "key_indicators": [
            "Subliminal/deceptive manipulation leading to physical/psychological harm.",
            "Targeting vulnerable demographics (elderly, kids, disabled, economically distressed).",
            "State or administrative social scoring networks.",
            "Workplace or school-based automated emotion trackers.",
            "Biometric categorization of protected sensitive traits (race, religion, sexuality).",
            "Mass scraping of public face databases (e.g. Clearview AI model)."
        ]
    },
    {
        "id": "Art_6_High_Risk_Rules",
        "title": "Article 6 - Classification Rules for High-Risk AI Systems",
        "source": "Legislation - EU AI Act",
        "url": "http://data.europa.eu/eli/reg/2024/1689/oj",
        "text": (
            "An AI system shall be considered high-risk if both of the following conditions are fulfilled:\n"
            "(a) The AI system is intended to be used as a safety component of a product, or is itself a product, "
            "covered by the Union harmonization legislation listed in Annex I (e.g. machinery, toys, elevators, medical devices, "
            "aviation, marine equipment), AND\n"
            "(b) The product or the safety component is required to undergo a third-party conformity assessment "
            "under that harmonization legislation.\n"
            "Additionally, AI systems referred to in Annex III shall be considered high-risk unless they do not "
            "pose a significant risk of harm to the health, safety or fundamental rights of natural persons."
        ),
        "key_indicators": [
            "Part of regulated hardware products (lifts, medical devices, cars, toys).",
            "Subject to third-party safety audits under Annex I harmonization.",
            "Standalone AI system listed under the Annex III specific categories."
        ]
    },
    {
        "id": "Annex_III_High_Risk_Categories",
        "title": "Annex III - High-Risk AI Use Cases (Standalone Systems)",
        "source": "Legislation - EU AI Act",
        "url": "http://data.europa.eu/eli/reg/2024/1689/oj",
        "text": (
            "The following standalone AI systems are high-risk:\n"
            "1. Biometrics: Remote biometric identification systems (real-time and post); Biometric categorization based on "
            "sensitive traits; Emotion recognition systems (outside workplace/education exception).\n"
            "2. Critical Infrastructure: AI systems intended to be used as safety components in the management and operation "
            "of road, water, gas, heating, electricity, and digital infrastructure.\n"
            "3. Education and Vocational Training: AI systems used to determine access or admission to education; AI systems "
            "used to evaluate learning outcomes or monitor student behavior during exams.\n"
            "4. Employment, Workers Management: AI systems used for recruitment or selection (sorting resumes, ranking applicants); "
            "AI systems used to make decisions on promotions, termination, task allocation, or performance monitoring.\n"
            "5. Access to Essential Services: AI systems used by public authorities to determine eligibility for social benefits; "
            "AI credit scoring systems used to assess creditworthiness of natural persons; AI systems for pricing and risk assessment "
            "in life and health insurance; AI systems for prioritizing emergency responses (police, fire, ambulance).\n"
            "6. Law Enforcement: AI systems used to assess recidivism risk, polygraphs, profiling of offenders, or detecting deepfakes for crime prevention.\n"
            "7. Migration, Asylum, Border Control: AI systems used to assess security risks, verify travel documents, or polygraphs.\n"
            "8. Administration of Justice: AI systems used by a judicial authority to assist in interpreting facts and the law."
        ),
        "key_indicators": [
            "Resume parsing and hiring screening tools.",
            "Credit scoring, lending eligibility, and insurance risk rating.",
            "Student admissions, grading, and proctoring.",
            "Utility grids, power plants, and telecom switching centers.",
            "Border checks, travel risk profiling, and visa vetting.",
            "Recidivism calculators or profiling tools used by police."
        ]
    },
    {
        "id": "Art_16_Provider_Obligations",
        "title": "Article 16 - General Obligations of Providers of High-Risk AI Systems",
        "source": "Legislation - EU AI Act",
        "url": "http://data.europa.eu/eli/reg/2024/1689/oj",
        "text": (
            "Providers of high-risk AI systems shall comply with the following structural duties:\n"
            "1. Ensure conformity: Ensure that their high-risk AI systems comply with the requirements set out in Chapter II "
            "(Articles 9-15 risk systems, data, documentation, logs, human oversight, cybersecurity).\n"
            "2. Quality Management System (QMS): Establish, document and maintain a quality management system ensuring systematic compliance (Art 17).\n"
            "3. Conformity Assessment: Draw up technical documentation and undergo the relevant conformity assessment procedure (Art 43) prior to placing on market.\n"
            "4. Keep logs: Retain automatically generated logs for at least 6 months (Art 20).\n"
            "5. Corrective Action: Immediately take necessary corrective actions, or recall/withdraw the system, if it is not in conformity (Art 21).\n"
            "6. CE Marking: Affix the CE marking of conformity to the system or packaging to certify compliance (Art 48).\n"
            "7. Registration: Register themselves and their specific high-risk system in the official EU database for high-risk AI systems (Art 49)."
        ),
        "key_indicators": [
            "Quality management systems and compliance officer appointments.",
            "Affixing CE marks on software delivery channels.",
            "Mandatory registration in the public EU AI Registry.",
            "Initiating immediate recall or shutoff processes if models drift."
        ]
    },
    {
        "id": "Art_22_25_Operators_Value_Chain",
        "title": "Articles 22-25 - Obligations of Value-Chain Operators (Importers & Distributors)",
        "source": "Legislation - EU AI Act",
        "url": "http://data.europa.eu/eli/reg/2024/1689/oj",
        "text": (
            "Any operator in the AI supply value-chain is subject to distinct requirements to ensure regulatory integrity:\n"
            "1. Article 22 (Authorized Representatives): Downstream providers based outside the EU must designate a legal representative "
            "within the Union with access to technical files and authority to coordinate with Market Surveillance Authorities.\n"
            "2. Article 23 (Importers): Entities importing an AI system from outside the EU must verify that the provider completed conformity "
            "assessments, compiled technical files, registered the system, and marked CE compliance. Importers must list their name/address on the system.\n"
            "3. Article 24 (Distributors): Distributors (resellers, retailers) must inspect the system to confirm it bears the CE mark and instructions of use.\n"
            "4. Article 25 (Downstream Integrators): Any distributor, importer or deployer that puts a high-risk AI system on the market under "
            "their own brand, or substantially modifies a model, shall be considered a 'Provider' and must assume all Article 16 responsibilities."
        ),
        "key_indicators": [
            "Importing software from US/UK/Asia into the EU market.",
            "Re-branding a white-labeled AI software package.",
            "Making significant modifications to models (fine-tuning, prompt architectures changing safety boundaries).",
            "Retailing third-party compliance products."
        ]
    },
    {
        "id": "Art_29a_FRIA",
        "title": "Article 29a - Fundamental Rights Impact Assessment (FRIA)",
        "source": "Legislation - EU AI Act",
        "url": "http://data.europa.eu/eli/reg/2024/1689/oj",
        "text": (
            "Prior to deploying a high-risk AI system, specific deployers must conduct a detailed Fundamental Rights "
            "Impact Assessment (FRIA). The assessment must analyze:\n"
            "1. Description of the deployer's specific processes and target populations.\n"
            "2. The specific categories of natural persons and vulnerable groups likely to be affected.\n"
            "3. The specific risks of harm to fundamental rights (equality, privacy, non-discrimination, fair trial).\n"
            "4. The human oversight measures and override rules configured to prevent these risks.\n"
            "5. The measures to be taken in case of actual realization of risks (incident response).\n"
            "FRIA is mandatory for deployers in specific sectors, including public authorities, banks/lenders, health insurance providers, "
            "education institutions (grading/admissions), and recruitment/employment software deployers."
        ),
        "key_indicators": [
            "Mandatory FRIA for employment ranking, screening, or firing.",
            "Credit scoring, life insurance pricing, or welfare eligibility checks.",
            "Public schools, universities, and grading systems.",
            "Government offices and administrative authorities."
        ]
    },
    {
        "id": "Art_50_Transparency_Labelling",
        "title": "Article 50 - Specific Transparency and Labelling Obligations",
        "source": "Legislation - EU AI Act",
        "url": "http://data.europa.eu/eli/reg/2024/1689/oj",
        "text": (
            "1. Providers shall ensure that AI systems intended to interact directly with natural persons are "
            "designed and developed in such a way that the natural persons concerned are informed that they are "
            "interacting with an AI system, unless this is obvious from the circumstances.\n"
            "2. Providers of AI systems, including GPAI systems, generating synthetic audio, image, video or text content, "
            "shall ensure that the outputs of the AI system are marked in a machine-readable format and detectable as "
            "artificially generated or manipulated (marking/watermarking obligations). Exceptions apply to authorized crime prevention, "
            "and creative/artistic/satirical works where marking does not impede display.\n"
            "3. Deployers of an emotion recognition system or a biometric categorization system shall inform the natural "
            "persons exposed thereto of the operation of the system.\n"
            "4. Deployers of an AI system that generates or manipulates image, audio or video content constituting a deepfake "
            "shall disclose that the content has been artificially generated or manipulated, by labeling the output accordingly."
        ),
        "key_indicators": [
            "Conversational chatbots and automated customer service avatars.",
            "Generative AI tools (Midjourney, DALL-E, GPT text writers).",
            "Synthetic audio generators and voice-cloning tools.",
            "Biometric trait classifiers or workplace safety checkups.",
            "Deepfakes, face-swapping, and video manipulations."
        ]
    },
    {
        "id": "Chapter_V_GPAI_Rules",
        "title": "Chapter V - General-Purpose AI (GPAI) Models & Obligations",
        "source": "Legislation - EU AI Act",
        "url": "http://data.europa.eu/eli/reg/2024/1689/oj",
        "text": (
            "A 'general-purpose AI model' (GPAI) is an AI model, including when trained with a large amount of data "
            "using self-supervision at scale, that displays significant generality and is capable of competently performing "
            "a wide range of distinct tasks and that can be integrated into a variety of downstream applications.\n"
            "GPAI Model Provider Obligations:\n"
            "- Draw up and maintain technical documentation of the model (training process, evaluation results).\n"
            "- Draw up information and documentation to downstream providers who intend to integrate the model.\n"
            "- Establish a policy to comply with Union copyright law.\n"
            "- Publish a sufficiently detailed summary about the content used for training.\n"
            "GPAI Models with Systemic Risks (compute > 10^25 FLOPs or designated as such):\n"
            "- Perform model evaluations, adversarial testing (red-teaming).\n"
            "- Assess and mitigate systemic risks at Union level.\n"
            "- Track and report serious incidents to the AI Office."
        ),
        "key_indicators": [
            "Large language models (LLMs like GPT-4, Gemini 1.5, Claude 3).",
            "Foundation models integrated as APIs into downstream SaaS apps.",
            "Models with high floating-point training compute (> 10^25 FLOPs).",
            "Copyright crawler policies and training data corpus disclosures."
        ]
    },
    {
        "id": "Art_51_GPAI_Systemic_Risk",
        "title": "Article 51 - General-Purpose AI Models with Systemic Risk",
        "source": "Legislation - EU AI Act",
        "url": "http://data.europa.eu/eli/reg/2024/1689/oj",
        "text": (
            "A GPAI model is classified as having systemic risk if it meets specific computing benchmarks:\n"
            "1. Cumulative compute: The model was trained using cumulative floating-point operations (FLOPs) greater than 10^25.\n"
            "2. AI Office decision: The European AI Office designates it as such due to high capability, downstream network reach, "
            "or potential risks of cyber-attacks, bioweapon design, or autonomous replication.\n"
            "Providers of systemic-risk GPAI models must:\n"
            "- Perform exhaustive adversarial testing, automated safety benchmarks, and red-teaming (Art 52).\n"
            "- Document and mitigate systemic risks, reporting security gaps and incident logs to the EU AI Office.\n"
            "- Establish robust cyber-resilience policies protecting weights and API channels."
        ),
        "key_indicators": [
            "Ultra-large language models (10^25 FLOP compute class).",
            "Involvement of EU AI Office in designation audits.",
            "National security adversarial red-teaming (cyber-weapons, chemical threats).",
            "Model weight leaks prevention."
        ]
    },
    {
        "id": "Art_9_15_HR_Governance",
        "title": "Articles 9-15 - Compliance Requirements for High-Risk AI Systems",
        "source": "Legislation - EU AI Act",
        "url": "http://data.europa.eu/eli/reg/2024/1689/oj",
        "text": (
            "Providers of High-Risk AI systems must establish a robust governance system:\n"
            "1. Article 9 (Risk Management System): Establish a continuous, iterative risk management system "
            "throughout the lifecycle of the AI system, including risk identification, estimation, and adoption of mitigation measures.\n"
            "2. Article 10 (Data and Data Governance): Training, validation, and testing datasets must be subject to "
            "appropriate data governance, including design choices, data collection, preparation, checks for bias, and data representation.\n"
            "3. Article 11 (Technical Documentation): Create and update technical documentation before putting the system "
            "on the market, showing compliance with all regulations.\n"
            "4. Article 12 (Record-keeping / Logging): Enable automatic logging of events ('system logs') during operation "
            "to ensure traceability, monitoring of operation, and post-market tracking.\n"
            "5. Article 13 (Transparency and Information): Design systems to allow deployers to understand the system's "
            "operations, outputs, and limitations. Provide a detailed 'instructions for use' document.\n"
            "6. Article 14 (Human Oversight): Design systems so that they can be effectively overseen by natural persons "
            "to prevent or minimize risks (e.g. override, shutoff, or validation switches).\n"
            "7. Article 15 (Accuracy, Robustness, Cybersecurity): Ensure appropriate levels of technical robustness, "
            "cyber-resilience, protection against model poisoning, adversarial inputs, and functional reliability."
        ),
        "key_indicators": [
            "Need for documented Risk Assessment spreadsheets.",
            "Auditable data cleaning, bias detection, and training pipelines.",
            "Automated system event logging (who accessed, when, what decision).",
            "User manuals and clear explanations of confidence intervals.",
            "Kill switches, human verification queues, and override buttons."
        ]
    },
    {
        "id": "Art_26_Deployer_Obligations",
        "title": "Article 26 - Obligations of Deployers of High-Risk AI",
        "source": "Legislation - EU AI Act",
        "url": "http://data.europa.eu/eli/reg/2024/1689/oj",
        "text": (
            "Deployers (organizations using high-risk AI systems in their professional activities) must comply with:\n"
            "1. Take appropriate technical and organizational measures to ensure they use the systems in accordance "
            "with the provided instructions of use.\n"
            "2. Assign human oversight to competent, trained natural persons who possess the necessary authority and support.\n"
            "3. Monitor the operation of the AI system based on instructions, and inform the provider/distributor of any "
            "serious incident or malfunctioning.\n"
            "4. Keep the logs automatically generated by the high-risk AI system for a period appropriate to its purpose "
            "(at least 6 months).\n"
            "5. Conduct a Fundamental Rights Impact Assessment (FRIA) prior to deploying high-risk systems in specific sectors "
            "(like public services, banking, or healthcare) assessing the impact on vulnerable groups, data processing, and oversight."
        ),
        "key_indicators": [
            "Downstream SaaS deployers using enterprise recruitment tools.",
            "Banks running vendor-provided credit scoring models.",
            "Mandatory Fundamental Rights Impact Assessments (FRIA).",
            "Human oversight training certifications and 6-month log archival."
        ]
    },
    {
        "id": "GDPR_Overlap",
        "title": "GDPR Overlap - Articles 22 and 35 (Data Protection)",
        "source": "Adjacent Law - GDPR",
        "url": "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
        "text": (
            "Where an AI system processes personal data, GDPR applies concurrently with the AI Act:\n"
            "1. Article 22 (Automated Individual Decision-Making): Data subjects have the right not to be subject "
            "to a decision based solely on automated processing, including profiling, which produces legal effects "
            "or similarly significantly affects them, unless authorized by law, explicit consent, or contract.\n"
            "2. Article 35 (Data Protection Impact Assessment - DPIA): A DPIA is mandatory before processing "
            "personal data when using new technologies that are likely to result in a high risk to the rights and freedoms "
            "of natural persons (such as systematic profiling or large-scale surveillance)."
        ),
        "key_indicators": [
            "Solely automated decision-making (no meaningful human review).",
            "Processing of personal data (names, emails, behavior, telemetry).",
            "Processing of special category sensitive data (health, politics, genetics).",
            "Mandatory DPIA triggers prior to system rollout."
        ]
    },
    {
        "id": "Finnish_Implementation",
        "title": "Finnish Implementation Context - Traficom & TEM",
        "source": "National - Finnish Implementation",
        "url": "https://traficom.fi/fi/tekoalyn-saantely/tietoa-eun-tekoalyasetuksesta",
        "text": (
            "In Finland, the national implementation of the EU AI Act is led by:\n"
            "1. Traficom (Finnish Transport and Communications Agency): Acts as the primary National Market Surveillance "
            "Authority (MSA) overseeing AI compliance, auditing technical documentation, and issuing penalties.\n"
            "2. TEM (Ministry of Economic Affairs and Employment): Coordinates legislative adaptation, setting up national "
            "administrative bodies, and facilitating domestic sandbox participation.\n"
            "3. Finnish Data Protection Act: Works alongside the AI Act to enforce privacy protections, overseen by "
            "the Finnish Office of the Data Protection Ombudsman (Tietosuojavaltuutettu)."
        ),
        "key_indicators": [
            "Deployments within Finnish borders or targeting Finnish citizens.",
            "Reporting requirements to the Finnish Market Surveillance Authority.",
            "Finnish Tietosuojavaltuutettu privacy overlap for consumer profiling."
        ]
    },
    {
        "id": "Adjacent_EU_Surveillance",
        "title": "Adjacent National Surveillance Context - CNIL, BfDI & AEPD",
        "source": "National - EU Implementation Boards",
        "url": "https://digital-strategy.ec.europa.eu/en/policies/national-market-surveillance-authorities",
        "text": (
            "Across the European Union, national market surveillance authorities coordinate enforcement of the AI Act:\n"
            "1. France - CNIL (Commission Nationale de l'Informatique et des Libertés): France's data watchdog acts as the leading "
            "authority, auditing AI systems for compliance with biometric limits, data training inputs bias, and profiling rules.\n"
            "2. Germany - BfDI (Federal Commissioner for Data Protection and Freedom of Information) & Federal Network Agency: "
            "Lead digital market oversight, ensuring human-in-the-loop and cyber robustness compliance.\n"
            "3. Spain - AEPD (Agencia Española de Protección de Datos): The first national body to implement active AI sandbox audits, "
            "vouching for robust conformity assessment registries and transparency guidelines."
        ),
        "key_indicators": [
            "AI systems operating in France, Germany, or Spain.",
            "CNIL biometric reviews and profiling audits.",
            "AEPD sandbox audit participation requests."
        ]
    },
    {
        "id": "Guidelines_AI_System_Def",
        "title": "Commission Guidelines on the AI System Definition",
        "source": "Official Guidance - Commission",
        "url": "https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-ai-system-definition-facilitate-first-ai-acts-rules-application",
        "text": (
            "The European Commission clarifies the distinction between simple software and AI systems:\n"
            "- A system is not 'AI' if it relies solely on pre-defined, deterministic logic written directly "
            "by programmers where the outputs map 1:1 to human-designed rules.\n"
            "- AI systems involve the creation of a mathematical model that infers parameters from data, allowing "
            "generalization and predictions on unseen inputs.\n"
            "- Varying levels of autonomy mean the system can perform actions without human intervention, ranging "
            "from highly automated batch systems to continuous active agents."
        ),
        "key_indicators": [
            "Machine learning, neural networks, or deep learning architectures.",
            "Evolutionary computation, probabilistic inference, or Bayesian networks.",
            "Deterministic excel sheets vs machine-learned models."
        ]
    },
    {
        "id": "Guidelines_Prohibited_AI",
        "title": "Commission Guidelines on Prohibited AI Practices",
        "source": "Official Guidance - Commission",
        "url": "https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelinesprohibited-artificial-intelligence-ai-practices-defined-ai-act",
        "text": (
            "The Commission's guidelines on Article 5 prohibitions provide detailed testing criteria:\n"
            "- 'Subliminal techniques' mean stimuli presented below the threshold of conscious perception (e.g. ultra-fast flashes, "
            "acoustic frequencies, or micro-targeted UI changes designed to bypass rational thought).\n"
            "- 'Exploitation of vulnerabilities' is assessed against the average member of that group. Vulnerabilities "
            "can be situational (e.g., severe temporary financial distress, extreme sleep deprivation, grief) in addition to demographic.\n"
            "- 'Significant harm' includes physical, psychological, financial, or reputation damage resulting directly from "
            "the behavioral distortion caused by the AI system."
        ),
        "key_indicators": [
            "Gamification loops triggering compulsive micro-transactions in children.",
            "SaaS pricing micro-adjustments exploiting urgent individual financial pressure.",
            "Subliminal UI tricks in dark pattern web designs."
        ]
    },
    {
        "id": "Guidelines_Marking_Labelling",
        "title": "Commission Draft Code of Practice on Marking and Labelling",
        "source": "Official Guidance - Commission",
        "url": "https://digital-strategy.ec.europa.eu/en/library/commission-publishes-second-draft-code-practice-marking-and-labelling-ai-generated-content",
        "text": (
            "The Code of Practice defines technological standards for watermarking and metadata injection:\n"
            "- Watermarking: Visible or invisible signals embedded directly in the content structure (e.g., noise in images, "
            "frequency modulations in audio) that survive compression, cropping, and format changes.\n"
            "- Metadata: Standardized C2PA (Coalition for Content Provenance and Authenticity) metadata headers injected "
            "into files to detail creator, editor, and generative AI origin.\n"
            "- Verification interfaces: Providers must provide public or downstream tools to verify whether an output "
            "was generated by their models."
        ),
        "key_indicators": [
            "C2PA metadata manifest compliance.",
            "Robust digital watermarking for text, image, and video generators.",
            "Detection API endpoints for public verification."
        ]
    }
]
