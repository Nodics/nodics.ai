/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nexus.web/data/nexusComponentData @description Reusable Nexus page component content for governed WCMS Staged import. @owner nexus.web @layer data */
module.exports = {
  record0: {
    code: "nexusHomeBannerCarousel",
    typeCode: "nexusBannerCarouselType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      rotationIntervalMs: 10000,
      fadeDurationMs: 1400,
      imageTransitionMs: 1800,
      automaticRotation: true,
      transitionStrategy: "RANDOM",
    },
    subComponents: [
      {
        target: "nexusMicroservicesBanner",
        slot: "slides",
        index: 10,
        active: true,
      },
      {
        target: "nexusModularBanner",
        slot: "slides",
        index: 20,
        active: true,
      },
      {
        target: "nexusSecureBanner",
        slot: "slides",
        index: 30,
        active: true,
      },
    ],
  },
  record1: {
    code: "nexusMicroservicesBanner",
    typeCode: "nexusBannerSlideType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      title: "Microservices architecture",
      heading: "Enterprise capabilities that evolve independently.",
      subheading:
        "Compose focused services through governed APIs, explicit ownership and observable runtime contracts.",
      referenceImageCode: "nodicsMicroservicesHero",
      imageAlt:
        "Connected services representing the Nodics microservices architecture",
      buttons: [
        {
          label: "Explore Nodics",
          href: "#platform",
          style: "PRIMARY",
        },
        {
          label: "Read documentation",
          href: "https://docs.nodics.in",
          style: "SECONDARY",
        },
      ],
    },
  },
  record2: {
    code: "nexusModularBanner",
    typeCode: "nexusBannerSlideType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      title: "AI-enabled and modular",
      heading: "Build with clear boundaries, not framework forks.",
      subheading:
        "Use governed AI assistance for coding and administration while keeping decisions, permissions, and project ownership explicit.",
      referenceImageCode: "nodicsModularHero",
      imageAlt: "Composable modules representing the Nodics modular framework",
      buttons: [
        {
          label: "Explore features",
          href: "/#features",
          style: "PRIMARY",
        },
        {
          label: "Developer journey",
          href: "/developers",
          style: "SECONDARY",
        },
      ],
    },
  },
  record3: {
    code: "nexusSecureBanner",
    typeCode: "nexusBannerSlideType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      title: "Secure enterprise framework",
      heading: "Govern every journey from contract to operation.",
      subheading:
        "Make identity, authorization, data boundaries, observability and operational controls explicit from the start.",
      referenceImageCode: "nodicsSecureHero",
      imageAlt: "Protected enterprise data flows representing Nodics security",
      buttons: [
        {
          label: "Explore the ecosystem",
          href: "/ecosystem",
          style: "PRIMARY",
        },
        {
          label: "Contact Nodics",
          href: "/contact",
          style: "SECONDARY",
        },
      ],
    },
  },
  record4: {
    code: "nexusHomeAbout",
    typeCode: "nexusContentSectionType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "aboutus",
      kicker: "About Nodics",
      heading:
        "An AI-enabled application factory for durable enterprise platforms.",
      body: "Nodics combines governed AI assistance for coding and administration with modular runtime composition, content, commerce, workflow, communication, security, and operational contracts—without forcing customers into a framework fork.",
      metrics: [
        {
          value: "01",
          label: "Composable foundation",
        },
        {
          value: "02",
          label: "AI-assisted delivery",
        },
        {
          value: "03",
          label: "Governed operation",
        },
      ],
      href: "/about",
      linkLabel: "Discover our story",
      referenceImageCode: "nodicsAboutCollaboration",
      imageAlt:
        "Enterprise engineers collaborating around connected modular Nodics capabilities and a governed AI module",
    },
  },
  record5: {
    code: "nexusHomeWhy",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "features",
      kicker: "Framework features",
      heading:
        "Everything needed to compose, operate, and evolve enterprise journeys.",
      referenceImageCode: "nodicsFeaturesArchitecture",
      imageAlt:
        "A gold service module completing an interconnected Nodics enterprise capability system",
      href: "/features",
      linkLabel: "Explore all features",
      items: [
        {
          symbol: "AI",
          title: "AI-enabled delivery",
          text: "Assist developers with coding and Axis administrators with governed operational work, while preserving human authority and auditability.",
        },
        {
          symbol: "MOD",
          title: "Modular architecture",
          text: "Compose independently owned capabilities through explicit, upgradeable contracts.",
        },
        {
          symbol: "µS",
          title: "Microservices runtime",
          text: "Deploy focused services with governed APIs, configuration, discovery, and health visibility.",
        },
        {
          symbol: "CMS",
          title: "Content experiences",
          text: "Model catalogs, pages, components, renderers, media, and channel-specific delivery.",
        },
        {
          symbol: "COM",
          title: "Commerce journeys",
          text: "Connect product, pricing, promotion, inventory, checkout, order, and fulfillment capabilities.",
        },
        {
          symbol: "WF",
          title: "Workflow automation",
          text: "Coordinate human and system work through observable processes, tasks, triggers, and schedules.",
        },
        {
          symbol: "SEC",
          title: "Security and operations",
          text: "Make identity, authorization, audit, observability, and operational controls explicit.",
        },
      ],
    },
  },
  record6: {
    code: "nexusHomeProducts",
    typeCode: "nexusProductPortfolioType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "products",
      mode: "compact",
      kicker: "Nodics product portfolio",
      heading: "Products for the way your business works.",
      body: "From circular participation to digital commerce, start with a focused product experience and shape it around your customers, brand and operations.",
      products: [
        {
          title: "Waste Management",
          edition: "Showcased through Circa",
          category: "Waste & circularity",
          summary:
            "Designed for Telegram and WhatsApp, with no new mobile app to download. Connect customer conversations with guided submissions, operator review and circular rewards.",
          audience:
            "Collection operators, circular programmes and community partners.",
          highlights: [
            "Telegram & WhatsApp journeys",
            "No new mobile app",
            "Evidence, review & rewards",
          ],
          adoption: "Channel activation, collection rules and reward partners.",
          href: "/products/waste-management",
          referenceImageCode: "nexusProduct-waste-home",
          imageAlt: "Waste Management reference storefront on desktop",
          mobileScreen: {
            referenceImageCode: "nexusProduct-waste-mobile",
            imageAlt: "Waste Management reference storefront on mobile",
          },
        },
        {
          title: "Agora Apparel",
          edition: "Fashion commerce",
          category: "Commerce",
          summary:
            "Turn collections and campaigns into a connected fashion shopping experience, from discovery to order history.",
          audience:
            "Fashion brands, apparel retailers and curated marketplaces.",
          highlights: [
            "Collections & campaigns",
            "Product variants",
            "Cart & checkout",
          ],
          adoption:
            "Brand storytelling, product variants and fulfilment partners.",
          href: "/products/agora-apparel",
          referenceImageCode: "nexusProduct-apparel-home-v2",
          imageAlt: "Agora Apparel reference storefront on desktop",
          mobileScreen: {
            referenceImageCode: "nexusProduct-apparel-mobile-v2",
            imageAlt: "Agora Apparel reference storefront on mobile",
          },
        },
        {
          title: "Agora Electronics",
          edition: "Device commerce",
          category: "Commerce",
          summary:
            "Make devices easier to discover and buy with a focused catalogue, product details and a connected checkout.",
          audience:
            "Device retailers, electronics brands and specialist resellers.",
          highlights: [
            "Device catalogue",
            "Product details",
            "Customer orders",
          ],
          adoption: "Product specifications, stock, warranty and delivery.",
          href: "/products/agora-electronics",
          referenceImageCode: "nexusProduct-electronics-home",
          imageAlt: "Agora Electronics reference storefront on desktop",
          mobileScreen: {
            referenceImageCode: "nexusProduct-electronics-mobile",
            imageAlt: "Agora Electronics reference storefront on mobile",
          },
        },
        {
          title: "Agora Telco",
          edition: "Plan & device commerce",
          category: "Commerce",
          summary:
            "Present prepaid and postpaid offers through a branded storefront with a familiar commerce journey.",
          audience:
            "Telecom brands, service resellers and digital sales teams.",
          highlights: [
            "Prepaid & postpaid",
            "Offer discovery",
            "Commerce journey",
          ],
          adoption: "Offer rules, eligibility and carrier-system integration.",
          href: "/products/agora-telco",
          referenceImageCode: "nexusProduct-telco-home",
          imageAlt: "Agora Telco reference storefront on desktop",
          mobileScreen: {
            referenceImageCode: "nexusProduct-telco-mobile",
            imageAlt: "Agora Telco reference storefront on mobile",
          },
        },
      ],
      href: "/products",
      linkLabel: "Explore the full portfolio",
      previewLabel: "Desktop and mobile · Actual reference application screens",
      showcaseNote:
        "One Nodics foundation. Distinct industry experiences. Configured for your business.",
      contactLabel: "Discuss your use case",
    },
  },
  record7: {
    code: "nexusHomePlatform",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "platform",
      kicker: "Platform overview",
      heading: "One governed, AI-enabled foundation composed for each journey.",
      referenceImageCode: "oxaviaHeroTwo",
      imageAlt: "Team collaborating around a table",
      items: [
        {
          title: "Framework",
          text: "Reusable functional modules, contracts, and AI-ready context.",
        },
        {
          title: "Kickoff",
          text: "Runnable reference backend and project data for AI-assisted implementation.",
        },
        {
          title: "Axis",
          text: "BackOffice administration with governed AI assistance for operators.",
        },
        {
          title: "Nexus",
          text: "Public corporate and demonstration experiences.",
        },
      ],
      href: "/platform",
      linkLabel: "See the platform",
    },
  },
  record8: {
    code: "nexusHomeTechnology",
    typeCode: "nexusTechnologyType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Technology stack",
      heading: "Modern tools behind governed, AI-enabled enterprise delivery.",
      referenceImageCode: "nodicsAboutArchitecture",
      imageAlt:
        "Enterprise architects collaboratively mapping a governed technology journey",
      items: [
        "AI-assisted engineering",
        "AI-assisted administration",
        "Node.js",
        "Express.js",
        "TypeScript",
        "React",
        "MongoDB",
        "Redis",
        "Elasticsearch",
        "Apache Kafka",
        "ActiveMQ",
        "OpenAPI",
        "Container-ready",
      ],
    },
  },
  record9: {
    code: "nexusHomeSupport",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "support",
      kicker: "Nodics support",
      heading: "Support designed for governed enterprise delivery.",
      body: "Nodics support is structured around clear ownership, response expectations, and evidence-led resolution — so teams know where to go, what to provide, and how issues move from intake to closure.",
      href: "/support",
      linkLabel: "Explore support model",
      items: [
        {
          symbol: "CONTRACT",
          title: "Support contracts",
          text: "Structured support options for partners and customers who need defined ownership, response windows, and escalation paths.",
        },
        {
          symbol: "EVIDENCE",
          title: "Issue readiness",
          text: "Clear intake guidance helps teams provide environment, logs, runtime context, and reproduction details from the beginning.",
        },
        {
          symbol: "RESOLVE",
          title: "Resolution model",
          text: "Support is handled through severity, business impact, evidence, and module ownership — not generic ticket movement.",
        },
      ],
    },
  },
  record10: {
    code: "nexusHomeDevelopers",
    typeCode: "nexusContentSectionType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "AI-enabled developer experience",
      heading: "Build with AI. Keep ownership of your software.",
      body: "Use AI while keeping the ability to understand, change and operate your application. Nodics defines what belongs where, how to extend it and what to verify, so developers can work manually or with AI through the same source files and contracts.",
      href: "/developers",
      linkLabel: "Developer journey",
      referenceImageCode: "nodicsDeveloperExperience",
      imageAlt:
        "Enterprise software engineer working with a connected modular application architecture",
    },
  },
  record11: {
    code: "nexusHomeGithub",
    typeCode: "nexusGithubType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "GitHub and open source",
      heading: "Start from the Nodics GitHub organization.",
      body: "Nodics is growing across framework modules, platform services, experience applications, accelerators, documentation, and setup tooling. The organization page is the stable entry point: use it to discover the right repository for the layer you want to inspect, run, extend, or contribute to.",
      organizationHref: "https://github.com/Nodics",
      organizationLabel: "Open github.com/Nodics",
      developerKicker: "AI-enabled developer experience",
      developerHeading: "Build with AI. Keep ownership of your software.",
      developerBody:
        "Use AI while keeping the ability to understand, change and operate your application. Nodics defines what belongs where, how to extend it and what to verify, so developers can work manually or with AI through the same source files and contracts.",
      developerHref: "/developers",
      developerLinkLabel: "Developer journey",
      referenceImageCode: "nodicsDeveloperExperience",
      imageAlt:
        "Enterprise software engineer working with a connected modular application architecture",
      repositoryIntro:
        "Start with the installer when you want a working local setup. The remaining cards describe repository families, not a complete repository list, while the organization page stays the stable path for discovering new Nodics sources.",
      repositories: [
        {
          name: "nodics.installer",
          role: "Local setup entry point",
          description:
            "Bootstrap repository for initializing a local Nodics workspace, preparing the runtime shape, and helping evaluators move from GitHub discovery to a working system.",
          href: "https://github.com/Nodics/nodics.installer",
          linkLabel: "Start local setup",
        },
        {
          name: "Framework and platform sources",
          role: "Core source family",
          description:
            "Framework modules, runtime contracts, publication, content, commerce, communication, engagement, and platform capabilities stay in their owning source boundaries.",
          href: "https://github.com/orgs/Nodics/repositories",
          linkLabel: "Find source repositories",
        },
        {
          name: "Experience applications",
          role: "Frontend family",
          description:
            "Axis, Nexus, storefronts, and future public experiences can evolve as independent applications while consuming governed backend contracts.",
          href: "https://github.com/orgs/Nodics/repositories",
          linkLabel: "Explore applications",
        },
        {
          name: "Reference projects and tooling",
          role: "Adoption path",
          description:
            "Kickoff projects, installers, data packs, documentation packs, and accelerator repositories help evaluators move from discovery to a working local system.",
          href: "https://github.com/orgs/Nodics/repositories",
          linkLabel: "View source catalog",
        },
      ],
    },
  },
  record12: {
    code: "nexusHomeEcosystem",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "ecosystem",
      kicker: "Ecosystem and partners",
      heading: "Build together, clearly.",
      body: "Nodics connects framework maintainers, delivery partners, developers, and customers through explicit contracts. Reuse what belongs to the platform, extend what belongs to the project, and contribute improvements at the right boundary.",
      items: [
        {
          title: "Build with Nodics",
          text: "Developers use documented modules, APIs, renderers, and reference applications to move from evaluation to working journeys.",
        },
        {
          title: "Deliver as a partner",
          text: "Implementation partners accelerate customer delivery through reusable expertise while keeping integrations and customization project-owned.",
        },
        {
          title: "Evolve as a customer",
          text: "Customers retain control of business policy, data, branding, providers, and operational decisions on an upgradeable foundation.",
        },
      ],
      href: "/ecosystem",
      linkLabel: "Explore partnership paths",
    },
  },
  record13: {
    code: "nexusHomeTestimonials",
    typeCode: "nexusTestimonialsType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "testimonials",
      kicker: "Testimonials",
      heading: "Partner and customer perspectives.",
      body: "Illustrative profiles preview the intended experience and will be replaced with approved customer testimonials.",
      items: [
        {
          quote:
            "Nodics gave our engineering teams a shared foundation without taking away their freedom to deliver domain-specific experiences.",
          name: "Aarohi Mehta",
          role: "Illustrative profile · Director of Platform Engineering",
          avatarReferenceImageCode: "nexusTestimonialAarohi",
          avatarAlt: "Illustrative portrait of Aarohi Mehta",
        },
        {
          quote:
            "The modular architecture made complex enterprise boundaries easier to understand, govern, and evolve across delivery teams.",
          name: "Marcus Reed",
          role: "Illustrative profile · Enterprise Solutions Architect",
          avatarReferenceImageCode: "nexusTestimonialMarcus",
          avatarAlt: "Illustrative portrait of Marcus Reed",
        },
        {
          quote:
            "With Axis and AI-assisted workflows, our teams can move from configuration to a working customer journey with far greater clarity.",
          name: "Daniel Kim",
          role: "Illustrative profile · Head of Commerce Technology",
          avatarReferenceImageCode: "nexusTestimonialDaniel",
          avatarAlt: "Illustrative portrait of Daniel Kim",
        },
      ],
      emptyMessage:
        "Verified partner and customer perspectives are being prepared.",
    },
  },
  record14: {
    code: "nexusHomeNews",
    typeCode: "nexusNewsCarouselType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "news",
      kicker: "Latest news",
      heading: "What is taking shape across Nodics.",
      href: "/news",
      linkLabel: "View all news",
      items: [
        {
          label: "AI Architecture",
          title:
            "Nodics publishes new article on architecture behind AI-built applications.",
          summary:
            "The latest Nodics framework article explains why AI-built applications still need architecture, ownership, resilience, and governance when success arrives.",
          href: "/news/ai-built-application-who-built-architecture",
          linkLabel: "Read news",
          referenceImageCode: "nexusNewsPublicExperience",
          imageAlt:
            "Governed public Nexus experience connected to backend content",
        },
        {
          label: "Scalability",
          title:
            "Scalability article reframes growth as users, domains, teams, and time.",
          summary:
            "A new Nodics article argues that scalable software must grow across roles, permissions, business complexity, integrations, teams, security, and time.",
          href: "/news/scalability-beyond-servers-users-domains-teams-time",
          linkLabel: "Read news",
          referenceImageCode: "nexusNewsAxisRuntime",
          imageAlt:
            "Axis BackOffice capability connected to registered runtime modules",
        },
        {
          label: "AI Foundation",
          title:
            "Nodics thinking connects AI-assisted software with enterprise foundations.",
          summary:
            "The first article in the series asks how AI-generated applications can graduate from fast prototypes into serious businesses.",
          href: "/news/ai-assisted-software-needs-enterprise-foundations",
          linkLabel: "Read news",
          referenceImageCode: "nexusNewsEngagementApi",
          imageAlt:
            "Engagement public APIs connecting Nexus contact and testimonial journeys",
        },
        {
          label: "Nexus",
          title:
            "Nexus News and Blogs now carry Nodics framework thought leadership.",
          summary:
            "Sample editorial placeholders are being replaced with governed Nexus content based on public Nodics framework articles and production-ready themes.",
          href: "/news/nexus-news-blogs-carry-nodics-framework-thinking",
          linkLabel: "Read news",
          referenceImageCode: "nexusNewsEditorialRelease",
          imageAlt:
            "Governed editorial release flow for news and blog publishing",
        },
      ],
    },
  },
  record15: {
    code: "nexusHomeBlogs",
    typeCode: "nexusBlogCarouselType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "blogs",
      kicker: "Nodics insights",
      heading: "Ideas, updates, and engineering notes.",
      href: "/blogs",
      linkLabel: "View all insights",
      items: [
        {
          label: "AI Foundation",
          title: "Vibe coding on top of enterprise engineering.",
          summary:
            "AI-assisted development is making application creation faster, but successful software still needs security, tenancy, auditability, resilience, and integration foundations.",
          href: "/blog/vibe-coding-on-top-of-enterprise-engineering",
          linkLabel: "Read insight",
          referenceImageCode: "nexusBlogCustomerEngagement",
          imageAlt:
            "Customer engagement capability connected to governed Nexus public journeys",
        },
        {
          label: "Scalability",
          title: "Scalability is not only about servers.",
          summary:
            "Infrastructure is only one dimension of scale; enterprise applications also need to scale across people, domains, integrations, governance, and change.",
          href: "/blog/scalability-is-not-only-about-servers",
          linkLabel: "Read insight",
          referenceImageCode: "nexusBlogEditorialPublication",
          imageAlt:
            "Governed editorial publication delivered through Nodics CMS",
        },
        {
          label: "Architecture",
          title: "Who builds the architecture after AI builds the application?",
          summary:
            "AI can accelerate implementation, but architecture decides whether a growing product can stay available, governable, observable, and changeable.",
          href: "/blog/who-builds-architecture-after-ai-builds-application",
          linkLabel: "Read insight",
          referenceImageCode: "nexusBlogRuntimeDiscovery",
          imageAlt:
            "Runtime service discovery for portable Nodics frontend applications",
        },
        {
          label: "Governance",
          title: "From prototype speed to governed scale in Nodics.",
          summary:
            "Nodics connects fast application delivery with reusable module boundaries, publication control, runtime evidence, and operational governance.",
          href: "/blog/prototype-speed-to-governed-scale-in-nodics",
          linkLabel: "Read insight",
          referenceImageCode: "nexusBlogAxisOperations",
          imageAlt:
            "Axis business operations composed through clean framework capability",
        },
      ],
    },
  },
  record16: {
    code: "nexusHomeContact",
    typeCode: "nexusContactType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "contact",
      kicker: "Start a conversation",
      heading: "Turn your next enterprise challenge into a working journey.",
      body: "Tell us where you are starting and what outcome matters. We can explore the framework, shape an implementation path, or define how we work together.",
      href: "/contact",
      linkLabel: "Start the conversation",
      items: [
        {
          title: "Evaluate Nodics",
          text: "Understand the framework, reference applications, architecture, and fit for your enterprise landscape.",
        },
        {
          title: "Plan an implementation",
          text: "Shape the journey, ownership boundaries, integrations, delivery model, and practical path from reference to production.",
        },
        {
          title: "Build a partnership",
          text: "Discuss implementation expertise, reusable contributions, customer delivery, and long-term ecosystem participation.",
        },
      ],
      referenceImageCode: "nodicsContactArchitecture",
      imageAlt:
        "Modern enterprise innovation center with connected golden modular light nodes",
      formKicker: "Contact Nodics",
      formHeading: "Let's start working.",
      formBody:
        "Share a little about your organization, the journey you want to create, and where you need support. We will review your note and get back to you with the right next step.",
      formFields: [
        {
          name: "name",
          label: "Name",
          type: "text",
        },
        {
          name: "email",
          label: "Business email",
          type: "email",
        },
        {
          name: "company",
          label: "Company",
          type: "text",
        },
        {
          name: "conversationType",
          label: "Conversation type",
          type: "text",
        },
        {
          name: "message",
          label: "Message",
          multiline: true,
        },
      ],
      formSubmitLabel: "Send enquiry",
      formStatus:
        "Leave your details and the Nodics team will get back to you shortly.",
    },
  },
  record17: {
    code: "nexusAboutHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "About Nodics",
      heading: "Enterprise evolution, under control.",
      breadcrumbLabel: "About",
      body: "Reusable capabilities, governed AI, BackOffice operations, and project-owned customization in one clear framework contract.",
      referenceImageCode: "nodicsAboutArchitecture",
      imageAlt:
        "Enterprise architects shaping a connected modular Nodics platform",
    },
  },
  record18: {
    code: "nexusFeaturesHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics Features",
      heading: "Composable enterprise capabilities.",
      breadcrumbLabel: "Features",
      body: "Explore the reusable foundation for building, operating, securing, and evolving project-owned experiences.",
      referenceImageCode: "nodicsFeaturesArchitecture",
      imageAlt:
        "A golden service module completing an interconnected Nodics enterprise capability system",
    },
  },
  record19: {
    code: "nexusProductsHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Products by Nodics",
      heading: "A product for the journey ahead.",
      breadcrumbLabel: "Products",
      body: "Discover four focused experiences. Compare what they do, see them in action and find the right starting point for your business.",
      referenceImageCode: "nodicsProductOperatingModel",
      imageAlt: "Nodics product operating model visual",
    },
  },
  record20: {
    code: "nexusSupportHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics Support",
      heading: "From evaluation to delivery.",
      breadcrumbLabel: "Support",
      body: "Understand support paths, response expectations, and guidance for implementation and operation.",
      referenceImageCode: "nodicsSecureHero",
      imageAlt: "Governed enterprise support and operational controls",
    },
  },
  record21: {
    code: "nexusInvestorsHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics Investors",
      heading: "Durable technology ecosystem.",
      breadcrumbLabel: "Investors",
      body: "Connect with Nodics to discuss platform vision, ecosystem strategy, and responsible growth.",
      referenceImageCode: "nodicsAboutArchitecture",
      imageAlt: "Enterprise architects shaping a connected platform strategy",
    },
  },
  record22: {
    code: "nexusDonateHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Support Nodics",
      heading: "Help Nodics keep evolving.",
      breadcrumbLabel: "Donate",
      body: "Contribution channels will be published when ready. Until then, contact Nodics to discuss how you can help.",
      referenceImageCode: "nodicsAboutCollaboration",
      imageAlt:
        "Enterprise team collaborating around Nodics platform evolution",
    },
  },
  record23: {
    code: "nexusPlatformHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics Platform",
      heading: "Modular, AI-enabled framework.",
      breadcrumbLabel: "Platform",
      body: "See how reusable capabilities, project-owned customization, and governed runtime operations connect.",
      referenceImageCode: "nodicsMicroservicesHero",
      imageAlt:
        "Connected services representing the Nodics platform foundation",
    },
  },
  record24: {
    code: "nexusDevelopersHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Developer Experience",
      heading: "Build with Nodics, without losing the architecture.",
      breadcrumbLabel: "Developers",
      body: "Start from a working reference stack, understand the contracts, and use AI assistance to customize only what your project owns.",
      referenceImageCode: "nodicsDeveloperExperience",
      imageAlt:
        "Enterprise software engineer working with a connected modular application architecture",
    },
  },
  record25: {
    code: "nexusEcosystemHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics Ecosystem",
      heading: "A clearer way to build enterprise solutions together.",
      breadcrumbLabel: "Ecosystem",
      body: "Nodics creates a working space where customers, partners, developers, and framework maintainers can move fast without hiding ownership, support, security, or long-term evolution.",
      referenceImageCode: "nodicsAboutCollaboration",
      imageAlt:
        "Enterprise collaborators working across a connected Nodics ecosystem",
    },
  },
  record27: {
    code: "nexusContactHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Contact Nodics",
      heading: "Start the conversation.",
      breadcrumbLabel: "Contact",
      body: "Tell us where you are starting, what matters, and how Nodics can help you evaluate, implement, or partner.",
      referenceImageCode: "nodicsContactArchitecture",
      imageAlt:
        "Modern enterprise innovation center with connected golden modular light nodes",
    },
  },
  record28: {
    code: "nexusPrivacyHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Legal",
      heading: "Privacy with clear boundaries.",
      breadcrumbLabel: "Privacy",
      body: "How Nexus handles visitor information, contact requests, documentation access, evaluation data, and security responsibilities.",
      referenceImageCode: "nodicsSecureHero",
      imageAlt:
        "Secure enterprise controls representing Nodics privacy governance",
    },
  },
  record29: {
    code: "nexusTermsHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Legal",
      heading: "Clear use, clear responsibilities.",
      breadcrumbLabel: "Terms",
      body: "Rules for using this website, evaluating Nodics materials, linking to documentation, and respecting the Nodics license.",
      referenceImageCode: "nodicsSecureHero",
      imageAlt:
        "Secure enterprise controls representing Nodics terms governance",
    },
  },
  record30: {
    code: "nexusCookiesHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Legal",
      heading: "Useful, explainable cookies.",
      breadcrumbLabel: "Cookies",
      body: "How Nexus uses essential browser storage and how analytics or preference cookies should be introduced with clear notice.",
      referenceImageCode: "nodicsSecureHero",
      imageAlt:
        "Secure enterprise controls representing Nodics cookie governance",
    },
  },
  record31: {
    code: "nexusEditorialListingHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics Editorial",
      heading: "Nodics news and insights.",
      breadcrumbLabel: "Blogs",
      body: "Read architecture notes, platform updates, developer guidance, and ecosystem stories.",
      referenceImageCode: "nodicsAboutArchitecture",
      imageAlt:
        "Enterprise architects preparing a connected documentation and editorial gateway",
    },
  },
  record32: {
    code: "nexusEditorialDetailHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics Blog",
      heading: "Nodics framework insights.",
      breadcrumbLabel: "Article",
      body: "How AI-era application speed, enterprise architecture, and governed publication fit together in the Nodics ecosystem.",
      referenceImageCode: "nodicsFeaturesArchitecture",
      imageAlt:
        "A modular enterprise capability completing a connected architecture",
    },
  },
  record33: {
    code: "nexusAboutContent",
    typeCode: "nexusContentSectionType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "about-story",
      kicker: "Our story",
      heading:
        "Nodics exists to make enterprise delivery composable, governed, and easier to understand.",
      body: "Enterprise programs often repeat the same hard work: identity, catalog, content, workflow, communication, administration, integrations, security, observability, and release governance. Nodics turns those foundations into reusable framework capabilities while keeping customer-specific decisions in the project where they belong.",
      detailItems: [
        {
          eyebrow: "Problem",
          title:
            "Enterprise delivery becomes expensive when every project rebuilds the base.",
          text: "Teams lose time recreating common capability, wiring administrative tools, and explaining ownership again and again.",
        },
        {
          eyebrow: "Approach",
          title:
            "Nodics separates reusable platform contracts from project-owned journeys.",
          text: "The framework supplies stable capabilities; implementation teams configure, extend, and compose them for their customer context.",
        },
        {
          eyebrow: "Outcome",
          title:
            "Developers, partners, and operators can start from a working reference system.",
          text: "Kickoff demonstrates backend runtime and data, Axis manages operations, and Nexus explains the ecosystem through public experiences.",
        },
      ],
      metrics: [
        {
          value: "Core",
          label: "Reusable capability foundation",
        },
        {
          value: "Axis",
          label: "Operational control plane",
        },
        {
          value: "AI",
          label: "Assisted, governed delivery",
        },
      ],
      referenceImageCode: "nodicsAboutVerticalWorkshop",
      imageAlt:
        "Enterprise architects working with a vertical golden modular Nodics framework map",
    },
  },
  record34: {
    code: "nexusAboutPrinciples",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "about-principles",
      kicker: "What guides us",
      heading:
        "Principles that keep delivery fast without making the platform fragile.",
      body: "Nodics is intentionally opinionated about ownership, contracts, and operational evidence. That discipline helps customers and partners move faster while keeping future change manageable.",
      items: [
        {
          symbol: "OWN",
          title: "Explicit ownership",
          text: "Keep framework, project, data, frontend, and operational responsibilities visible so teams can evolve without parallel authority.",
        },
        {
          symbol: "AI",
          title: "Governed intelligence",
          text: "Use AI to accelerate engineering and administration while permissions, approvals, evidence, and final authority remain human-controlled.",
        },
        {
          symbol: "EVO",
          title: "Evolution by design",
          text: "Compose modular capabilities through stable contracts so customer journeys can change without rebuilding the foundation.",
        },
        {
          symbol: "SEC",
          title: "Security as contract",
          text: "Treat tenant scope, authorization, private media, route exposure, and audit evidence as part of the product design.",
        },
        {
          symbol: "OPS",
          title: "Operations first",
          text: "Expose capabilities through Axis so administrators can manage data, schemas, content, and runtime behavior with confidence.",
        },
        {
          symbol: "DX",
          title: "Developer clarity",
          text: "Make local setup, module boundaries, generated contracts, and documentation easy to inspect before teams customize.",
        },
      ],
    },
  },
  record35: {
    code: "nexusAboutPromise",
    typeCode: "nexusContentSectionType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "about-promise",
      kicker: "Our promise",
      heading: "AI-assisted development with human ownership.",
      body: "Nodics is designed to let a team use AI without surrendering its ability to understand, change and operate the software. Your engineering experience remains valuable: inspect the contracts, customize through supported layers and keep manual development a first-class way of working.",
      detailItems: [
        {
          eyebrow: "01",
          title: "Run the reference system",
          text: "Start with the framework, Kickoff backend data, Axis administration, and Nexus public experience running locally.",
        },
        {
          eyebrow: "02",
          title: "Understand the contracts",
          text: "Use documentation, generated schemas, API reference, and Axis workbenches to see what each module owns.",
        },
        {
          eyebrow: "03",
          title: "Customize what the project owns",
          text: "Rename, configure, extend, integrate, and style the customer journey without modifying framework ownership.",
        },
        {
          eyebrow: "04",
          title: "Operate with confidence",
          text: "Manage content, data, security, and runtime behavior through controlled administrative and AI-assisted workflows.",
        },
      ],
      metrics: [
        {
          value: "Run",
          label: "Local reference",
        },
        {
          value: "Learn",
          label: "Framework contracts",
        },
        {
          value: "Evolve",
          label: "Customer journeys",
        },
      ],
      referenceImageCode: "nodicsAboutVerticalOperations",
      imageAlt:
        "Enterprise operator reviewing a vertical Nodics journey from local setup to governed live operation",
      href: "/docs/framework",
      linkLabel: "What is Nodics?",
    },
  },
  record36: {
    code: "nexusFeaturesContent",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "feature-overview",
      kicker: "Business capability layer",
      heading: "Turn common enterprise work into reusable business capability.",
      body: "Nodics helps partners move faster without hiding the controls that enterprise delivery needs: ownership, operations, security, documentation, and change readiness.",
      items: [
        {
          symbol: "TTV",
          title: "Faster time to value",
          text: "Start from a working reference platform instead of rebuilding identity, content, operations, documentation, and API foundations for every project.",
        },
        {
          symbol: "CTL",
          title: "Business control",
          text: "Manage content, imports, documentation, schemas, and operational visibility through governed BackOffice experiences instead of hidden scripts.",
        },
        {
          symbol: "OWN",
          title: "Clear ownership",
          text: "Know what belongs to the framework, what belongs to the customer project, and what can be extended without creating a long-term fork.",
        },
        {
          symbol: "RUN",
          title: "Operational readiness",
          text: "Use runtime modules, API contracts, import releases, and documentation packs as evidence before promoting a journey beyond local preview.",
        },
        {
          symbol: "SEC",
          title: "Safer growth",
          text: "Keep tenant scope, authorization, private media, audit-sensitive actions, and public route exposure visible as the product scales.",
        },
      ],
      href: "/docs",
      linkLabel: "Explore the framework",
    },
  },
  record37: {
    code: "nexusProductsContent",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: false,
    properties: {
      anchor: "product-overview",
      kicker: "Product philosophy",
      heading: "Productized capability without losing framework ownership.",
      body: "Nodics products are not isolated applications. They are reusable capability packages built on the same framework contract, so partners can adopt a productized journey while still knowing what is reusable, configurable, and project-owned.",
      items: [
        {
          symbol: "OWN",
          title: "Clear ownership",
          text: "Every product direction keeps source ownership explicit across framework modules, customer extensions, CMS data, renderers, and operational controls.",
        },
        {
          symbol: "OPS",
          title: "Operational by design",
          text: "Products are expected to expose administration, visibility, support evidence, import/export readiness, and documentation from the beginning.",
        },
        {
          symbol: "AI",
          title: "AI-assisted delivery",
          text: "AI can help teams generate, inspect, document, and operate product journeys because the contracts, schemas, and boundaries are visible.",
        },
        {
          symbol: "EXT",
          title: "Project extension",
          text: "Customer-specific payment, fulfillment, analytics, data, compliance, and integration behavior lives in project-owned extensions, not hidden framework forks.",
        },
      ],
    },
  },
  record57: {
    code: "nexusProductsSuite",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: false,
    properties: {
      anchor: "product-suite",
      kicker: "Product suite",
      heading: "Focused product directions for repeatable enterprise needs.",
      body: "The first Nodics product directions focus on work that many enterprise journeys need repeatedly: controlled task execution and governed data engineering. Each product should remain modular, observable, and extensible through the Nodics runtime.",
      items: [
        {
          symbol: "TEE",
          title: "Task Execution Engine",
          text: "A reusable execution product for persisted scheduling, distributed task coordination, retries, operator visibility, and controlled execution across project runtimes.",
        },
        {
          symbol: "DEAP",
          title: "Data Engineering & Analytics Platform",
          text: "A governed data product direction for source onboarding, ingestion, transformation, quality, analysis, visualization, and publishing to approved destinations.",
        },
        {
          symbol: "NEX",
          title: "Nexus reference experience",
          text: "A public and demo-facing experience proving that CMS content, documentation, APIs, media, and product journeys can be composed without hardcoded pages.",
        },
      ],
    },
  },
  record58: {
    code: "nexusProductsOperatingModel",
    typeCode: "nexusContentSectionType",
    accessMode: "PUBLIC",
    active: false,
    properties: {
      anchor: "product-operating-model",
      kicker: "Operating model",
      heading:
        "Products should be installable, visible, and safely extensible.",
      body: "A Nodics product is useful only when a partner can run it locally, inspect its contracts, understand its data, manage it from Axis, render its public experience through Nexus when needed, and extend customer-specific behavior without breaking the reusable core.",
      detailItems: [
        {
          eyebrow: "01",
          title: "Backend-owned capability",
          text: "Business rules, schemas, imports, APIs, and runtime services stay with the owning backend module or product package.",
        },
        {
          eyebrow: "02",
          title: "Axis-managed operation",
          text: "Registration, activation, workbenches, visibility, API reference, content, and support controls should become administrable instead of script-only.",
        },
        {
          eyebrow: "03",
          title: "Nexus-rendered experience",
          text: "Public product pages, documentation gateways, and demo journeys render from managed content and frontend renderers.",
        },
        {
          eyebrow: "04",
          title: "Customer-owned extension",
          text: "Project teams add integrations, policies, copy, branding, and process customizations in their own modules and data packs.",
        },
      ],
      metrics: [
        {
          value: "Run",
          label: "local proof",
        },
        {
          value: "Inspect",
          label: "contracts",
        },
        {
          value: "Extend",
          label: "safely",
        },
      ],
      referenceImageCode: "nodicsProductOperatingModel",
      imageAlt:
        "Installable product module placed into a visible and safely extensible Nodics operating model",
    },
  },
  record59: {
    code: "nexusProductsReadiness",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: false,
    properties: {
      anchor: "product-readiness",
      kicker: "Readiness path",
      heading: "From framework capability to product-grade journey.",
      body: "Productization should not mean hiding complexity. It means packaging repeatable capability with enough contracts, data, documentation, operations, and support clarity that a partner can adopt it confidently.",
      items: [
        {
          symbol: "01",
          title: "Foundation available",
          text: "Use the framework, Kickoff, Axis, Nexus, documentation, OpenAPI reference, CMS, and module registry as the reference foundation.",
        },
        {
          symbol: "02",
          title: "Product journey shaped",
          text: "Define the product package, backend ownership, managed content, sample data, workbenches, APIs, and acceptance evidence.",
        },
        {
          symbol: "03",
          title: "Customer solution composed",
          text: "Rename, configure, integrate, brand, and extend the product for the customer while preserving upgradeable framework boundaries.",
        },
      ],
      href: "/contact",
      linkLabel: "Discuss a product journey",
    },
  },
  record38: {
    code: "nexusSupportContent",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "support-overview",
      kicker: "Support model",
      heading: "Support should be clear before the project is critical.",
      body: "Nodics support starts with transparent public material, then adds guided evaluation, launch readiness, and contracted operational support when a team needs committed accountability.",
      items: [
        {
          symbol: "DOC",
          title: "Self-service knowledge",
          text: "Use Nexus Wiki, API reference, and repository evidence to understand framework contracts, setup, modules, and operational behavior before raising a request.",
        },
        {
          symbol: "GUIDE",
          title: "Implementation guidance",
          text: "Get help with architecture direction, module boundaries, data-pack ownership, renderer behavior, and AI-assisted customization practices.",
        },
        {
          symbol: "READY",
          title: "Launch readiness",
          text: "Review release evidence, environment setup, documentation packs, API exposure, import status, security posture, and operational checkpoints before go-live.",
        },
      ],
      href: "/docs",
      linkLabel: "Open Wiki",
    },
  },
  record39: {
    code: "nexusInvestorsContent",
    typeCode: "nexusContentSectionType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Investors",
      heading: "Help shape a durable enterprise technology ecosystem.",
      body: "Connect with Nodics to discuss the platform vision, ecosystem strategy, and responsible opportunities to support its growth.",
      href: "/contact",
      linkLabel: "Contact Nodics",
    },
  },
  record40: {
    code: "nexusDonateContent",
    typeCode: "nexusContentSectionType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Donate",
      heading: "Support the continued development of Nodics.",
      body: "Donation options will be published after the approved contribution channel and governance process are available. Contact Nodics if you would like to help today.",
      href: "/contact",
      linkLabel: "Contact Nodics",
    },
  },
  record41: {
    code: "nexusPlatformContent",
    typeCode: "nexusContentSectionType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Platform",
      heading: "Modular, AI-enabled framework.",
      body: "Nodics combines AI-assisted engineering and administration with runtime composition, content, commerce, identity, workflow, communication, media, security, and observability. Detailed architecture and APIs remain in documentation.",
      href: "https://docs.nodics.in",
      linkLabel: "Open documentation",
    },
  },
  record42: {
    code: "nexusDevelopersContent",
    typeCode: "nexusContentSectionType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "developer-overview",
      kicker: "Developer foundation",
      heading: "Build faster without losing engineering control.",
      body: "Nodics gives developers a governed starting point for enterprise delivery: reusable capabilities, visible contracts, AI-assisted workflows, and clear project boundaries that stay understandable as teams customize.",
      referenceImageCode: "nodicsDeveloperContractWorkshop",
      imageAlt:
        "Developers planning governed Nodics project contracts in an enterprise workspace",
      detailItems: [
        {
          eyebrow: "Start",
          title: "Run the reference stack before changing it.",
          text: "Bring up nodics.ai, nodics.kickoff, nodics.axis, and nodics.nexus to see the framework, runtime, admin console, and public experience working together.",
        },
        {
          eyebrow: "Understand",
          title: "Inspect contracts before writing project code.",
          text: "Use Axis, documentation, API reference, schemas, content packs, and runtime registration to see which capability owns each decision.",
        },
        {
          eyebrow: "Customize",
          title: "Extend the project boundary, not the framework core.",
          text: "Rename Kickoff and Nexus for the customer, then add project-owned data, integrations, providers, tests, and presentation changes through clear extension points.",
        },
      ],
      metrics: [
        {
          value: "4",
          label: "Reference repositories",
        },
        {
          value: "1",
          label: "Working local journey",
        },
        {
          value: "AI",
          label: "Assisted but governed",
        },
      ],
      href: "/docs",
      linkLabel: "Open Wiki",
    },
  },
  record43: {
    code: "nexusEcosystemContent",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "ecosystem-overview",
      kicker: "Ecosystem model",
      heading: "Shared foundation. Customer-owned outcomes.",
      body: "The goal is simple: stop rebuilding the same enterprise foundation for every customer, while still giving each project the freedom to own its data, integrations, brand, journey, and operating model.",
      items: [
        {
          symbol: "BASE",
          title: "Start from working capability",
          text: "Partners begin with a runnable framework, reference backend, Axis BackOffice, Nexus public site, docs, APIs, sample data, and visible module contracts.",
        },
        {
          symbol: "OWN",
          title: "Keep customer work separate",
          text: "Customer-specific rules, content, integrations, providers, payment, fulfilment, branding, and operating policy stay in the project boundary.",
        },
        {
          symbol: "LOOP",
          title: "Feed reusable learning back",
          text: "When a project exposes a useful pattern, it can be reviewed and promoted into reusable framework capability without carrying customer-specific assumptions.",
        },
      ],
      href: "/contact",
      linkLabel: "Start a partnership conversation",
    },
  },
  record90: {
    code: "nexusEcosystemRoles",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "ecosystem-roles",
      kicker: "Who it serves",
      heading: "Different teams, one operating language.",
      body: "A healthy ecosystem is not only a GitHub repository. It is the agreement between people who evaluate, sell, implement, operate, support, extend, document, and evolve enterprise journeys.",
      items: [
        {
          symbol: "CXO",
          title: "Customers and business owners",
          text: "See what is available, what must be customized, what can be operated in Axis, and what evidence exists before trusting the platform for real delivery.",
        },
        {
          symbol: "PART",
          title: "Implementation partners",
          text: "Use the reference stack to accelerate proposals, demos, discovery, solution shaping, and delivery while keeping customer extensions upgrade-friendly.",
        },
        {
          symbol: "DEV",
          title: "Developers and architects",
          text: "Inspect schemas, APIs, routes, documentation, CMS data, module registration, and ownership boundaries before changing production behavior.",
        },
        {
          symbol: "AXIS",
          title: "Operators and administrators",
          text: "Manage content, records, configuration, API reference, documentation, support evidence, testimonials, and approvals through governed BackOffice flows.",
        },
      ],
    },
  },
  record91: {
    code: "nexusEcosystemContribution",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "ecosystem-contribution",
      kicker: "Partner value",
      heading: "Make delivery repeatable without making it rigid.",
      body: "Nodics should help partners protect margin and quality: less repeated foundation work, more visible contracts, better support evidence, and safer AI-assisted delivery.",
      items: [
        {
          symbol: "01",
          title: "Shorter discovery-to-demo cycle",
          text: "Show a working local journey quickly, then focus the conversation on customer outcomes instead of rebuilding platform plumbing.",
        },
        {
          symbol: "02",
          title: "Cleaner implementation ownership",
          text: "Know which change belongs in the framework, which belongs in Kickoff-style project modules, and which belongs only to the customer.",
        },
        {
          symbol: "03",
          title: "Better support conversations",
          text: "Use documentation, API reference, CMS state, release manifests, logs, and Axis visibility to discuss issues with evidence, not guesswork.",
        },
        {
          symbol: "04",
          title: "Governed community signal",
          text: "Approved testimonials, implementation notes, partner stories, and reusable patterns can be reviewed in Axis before they appear publicly.",
        },
      ],
    },
  },
  record89: {
    code: "nexusEcosystemJourney",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "ecosystem-journey",
      kicker: "Collaboration path",
      heading: "From first clone to trusted customer delivery.",
      body: "The ecosystem journey should feel practical: prove the platform, understand the boundaries, shape the customer solution, then contribute what truly belongs back to the shared foundation.",
      items: [
        {
          symbol: "RUN",
          title: "Experience",
          text: "Run the local reference stack and see the framework, runtime, BackOffice, public site, documentation, and API contract working together.",
        },
        {
          symbol: "SEE",
          title: "Map",
          text: "Identify which capabilities are reusable, which data belongs to the project, and where customer-specific integration or policy must live.",
        },
        {
          symbol: "MAKE",
          title: "Deliver",
          text: "Customize the project boundary, activate the required modules, connect providers, shape the public experience, and manage operations through Axis.",
        },
        {
          symbol: "GROW",
          title: "Contribute",
          text: "Promote reusable improvements, documentation, and partner knowledge without exposing customer data, commercial context, or private implementation detail.",
        },
      ],
      href: "/developers",
      linkLabel: "Open developer path",
    },
  },
  record45: {
    code: "nexusContactContent",
    typeCode: "nexusContactType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Start with clarity",
      heading: "Tell us where your enterprise journey needs to move next.",
      body: "Whether you are evaluating Nodics, planning a customer implementation, or exploring a delivery partnership, start with the outcome you want to create. We will route the conversation to the right next step.",
      items: [
        {
          title: "Evaluate the framework",
          text: "Discuss architecture, module ownership, documentation, local setup, and whether Nodics fits your enterprise platform direction.",
        },
        {
          title: "Plan a customer journey",
          text: "Shape the first implementation path, project boundaries, integrations, support expectations, and the safest route from reference to production.",
        },
        {
          title: "Explore partnership",
          text: "Talk about implementation collaboration, ecosystem contribution, commercial alignment, and long-term capability ownership.",
        },
      ],
      referenceImageCode: "nodicsContactArchitecture",
      imageAlt:
        "Modern enterprise innovation center with connected golden modular light nodes",
      formKicker: "Contact Nodics",
      formHeading: "Share the starting point.",
      formBody:
        "Tell us who you are, what you are trying to build, and whether the conversation is about evaluation, implementation, support, or partnership. Keep it simple; we can add detail together.",
      formFields: [
        {
          name: "name",
          label: "Name",
          type: "text",
        },
        {
          name: "email",
          label: "Business email",
          type: "email",
        },
        {
          name: "company",
          label: "Organization",
          type: "text",
        },
        {
          name: "conversationType",
          label: "Conversation type",
          type: "text",
        },
        {
          name: "message",
          label: "What should we explore?",
          multiline: true,
        },
      ],
      formSubmitLabel: "Send enquiry",
      formStatus:
        "Your message will be reviewed and routed to the right Nodics conversation.",
      testimonialKicker: "Tell us if you like Nodics",
      testimonialHeading: "Share your Nodics moment with the community.",
      testimonialBody:
        "If Nodics made the framework, delivery model, documentation, or BackOffice experience clearer for you, we would love to hear it. Approved testimonials can later be reviewed in Axis before they appear publicly.",
      testimonialItems: [
        "What problem were you trying to solve?",
        "Which Nodics capability or idea helped most?",
        "What should other teams know before they start?",
      ],
      testimonialLinkLabel: "Submit",
      testimonialStatus:
        "Your note becomes a governed testimonial candidate. Axis users can review, curate, approve, and publish it later.",
    },
  },
  record46: {
    code: "nexusPrivacyContent",
    typeCode: "nexusContentSectionType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Privacy Policy",
      heading:
        "We collect only what is needed to explain, support, secure, and improve Nodics.",
      body: "This policy is written for Nodics Nexus visitors, evaluators, partners, contributors, and customer teams. It summarizes the intended public-site privacy posture for the local reference site and should be reviewed against the final production hosting, analytics, support, and legal setup before deployment.",
      summary:
        "Nexus is designed as a public information, documentation, and evaluation experience. We keep visitor data limited, purposeful, and separate from production customer records.",
      effectiveLabel: "Privacy commitment",
      effectiveDate: "Clear purpose · limited collection · secure handling",
      policyHighlights: [
        {
          label: "Contact",
          value: "nodics.framework@gmail.com",
        },
        {
          label: "Protected by design",
          value:
            "Tenant scope, token boundaries, audit controls, and private media rules",
        },
        {
          label: "Data boundary",
          value:
            "Public-site data is not production customer, payment, or sensitive business data",
        },
      ],
      policySections: [
        {
          title: "Information we may collect",
          body: "Nexus may collect information that you choose to provide and limited technical information needed to operate the site.",
          items: [
            "Contact details submitted through enquiry, support, partner, investor, or evaluation forms, such as name, organization, email address, role, and message content.",
            "Technical request data such as IP address, browser type, device information, referring page, timestamps, page path, and security logs generated by hosting or backend services.",
            "Documentation and API reference usage signals, if analytics are enabled, to understand which public materials help visitors most.",
            "Communication records when you email Nodics or interact with approved support, security, partner, or contributor channels.",
          ],
        },
        {
          title: "How we use information",
          body: "We use information for legitimate product, security, support, and communication purposes connected with Nodics.",
          items: [
            "Respond to enquiries, product evaluation requests, partner conversations, support questions, and vulnerability reports.",
            "Operate Nexus, documentation, public API references, and related backend delivery services safely and reliably.",
            "Improve public content, onboarding journeys, documentation clarity, and developer experience.",
            "Protect against abuse, unauthorized access, spam, scraping, service disruption, and accidental exposure of private content.",
            "Maintain records required by commercial, partner, contributor, evaluation, security, or legal obligations.",
          ],
        },
        {
          title: "How information is shared",
          body: "Nodics does not sell public-site visitor information. Information may be shared only where needed to operate, secure, support, or comply.",
          items: [
            "With infrastructure, email, analytics, monitoring, repository, support, or security providers acting for Nodics under appropriate operational controls.",
            "With authorized Nodics personnel, implementation partners, or advisors when they need the information to respond to a request or support an agreed engagement.",
            "When required by law, legal process, contractual obligations, security investigation, or to protect Nodics, customers, partners, or the public.",
            "With a customer or partner organization when the request clearly belongs to that organization’s evaluation, support, or project relationship.",
          ],
        },
        {
          title: "Security and retention",
          body: "Nodics treats security as a product contract, not a best-effort preference. The same design principles used in the framework apply to Nexus policy data.",
          items: [
            "Security work must preserve tenant and enterprise scope, service-token versus human-token boundaries, generated-route authorization, private media exposure controls, audit evidence, and module ownership.",
            "Records are retained only for as long as needed for the purpose collected, legal obligations, security investigation, support history, or commercial relationship management.",
            "Sensitive information, credentials, secrets, production customer records, payment data, and private environment details should not be submitted through public forms or emails unless an approved secure channel exists.",
            "Vulnerabilities should be reported through the agreed Nodics support or security contact and should not be publicly disclosed before triage.",
          ],
        },
        {
          title: "Your choices and rights",
          body: "Depending on your location and relationship with Nodics, you may have rights to access, correct, delete, restrict, object to, or receive a copy of personal information.",
          items: [
            "You can contact Nodics to request correction, deletion, or clarification of information submitted through Nexus or support conversations.",
            "You can refuse non-essential cookies or analytics where a consent mechanism is provided.",
            "You can choose not to submit optional form fields; however, Nodics may need enough information to respond to a request.",
            "Commercial, partner, contributor, and customer agreements may define additional data handling, retention, audit, or security terms.",
          ],
        },
        {
          title: "International and production deployment notes",
          body: "Nexus is designed for global enterprise visitors, but production deployment details matter.",
          items: [
            "Final production policy must reflect the actual hosting region, subprocessors, analytics tools, support channels, consent tooling, retention schedules, and legal entity details.",
            "If a signed agreement with Nodics provides stronger or more specific privacy, confidentiality, data-processing, or security terms, that agreement controls for the covered scope.",
            "This page is informational and should be reviewed by qualified legal counsel before being treated as production legal advice.",
          ],
        },
      ],
      href: "mailto:nodics.framework@gmail.com",
      linkLabel: "Contact Nodics about privacy",
    },
  },
  record47: {
    code: "nexusTermsContent",
    typeCode: "nexusContentSectionType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Terms of Use",
      heading:
        "Nexus is an information gateway; Nodics software use is governed by written agreements.",
      body: "These terms explain acceptable use of the public Nodics Nexus website, documentation, public API reference, examples, and evaluation materials. They do not replace a signed commercial, partner, evaluation, contributor, support, data-processing, or software license agreement.",
      summary:
        "Nexus explains Nodics capabilities and documentation. Software use, production rights, commercial permissions, and partner obligations remain governed by written Nodics agreements.",
      effectiveLabel: "Use framework",
      effectiveDate: "Website access · documentation use · license boundaries",
      policyHighlights: [
        {
          label: "License model",
          value: "Source-available commercial license",
        },
        {
          label: "Agreement priority",
          value:
            "Signed Nodics agreements control the covered commercial scope",
        },
        {
          label: "Public materials",
          value:
            "Documentation and examples are provided for evaluation and guidance",
        },
      ],
      policySections: [
        {
          title: "Using the website and materials",
          body: "You may browse Nexus, read public documentation, inspect public API reference information, and contact Nodics for evaluation, partnership, support, or contribution discussions.",
          items: [
            "Do not misuse the website, interfere with availability, attempt unauthorized access, bypass controls, scrape aggressively, or submit harmful content.",
            "Do not represent public preview content as a binding production commitment unless it appears in a signed Nodics agreement.",
            "Do not rely on examples, local references, screenshots, sample data, or documentation as a substitute for project-specific design, security, testing, or legal review.",
            "Public links to GitHub, Axis, documentation, or third-party sites may open external services with their own terms and policies.",
          ],
        },
        {
          title: "Nodics software and source availability",
          body: "The Nodics framework and related repositories are governed by the Nodics Source-Available Commercial License and any separate written agreement with Nodics.",
          items: [
            "Possession of source code does not grant an open-source license, patent license, trademark license, resale right, white-label right, competing platform right, or production-use right unless expressly granted in writing.",
            "Authorized customers, partners, and contributors may inspect, evaluate, customize, and extend Nodics only within the permissions granted by their written agreement.",
            "Customer-specific modules may extend Nodics through documented customization contracts but must not remove notices, bypass license checks, or misrepresent Nodics ownership.",
            "If a signed agreement conflicts with these website terms or the repository license text, the signed agreement controls for the covered scope.",
          ],
        },
        {
          title: "Intellectual property and brand",
          body: "Nodics, Nodics Nexus, Nodics Axis, logos, product names, framework architecture, documentation, source code, designs, and related materials are owned by Nodics or its licensors unless stated otherwise.",
          items: [
            "You may not copy, publish, sell, sublicense, host as a competing framework service, or create a substantially similar platform product without written permission.",
            "Feedback, suggestions, or issue reports may be used by Nodics to improve products without creating compensation, ownership transfer, or confidentiality obligations unless agreed separately.",
            "Third-party names, technologies, templates, libraries, and services remain the property of their respective owners.",
          ],
        },
        {
          title: "Accounts, access, and public API reference",
          body: "Nexus may link to Axis, documentation, or API reference views. Public API reference is read-only and does not grant permission to execute protected APIs.",
          items: [
            "Authenticated administration, authoring, import/export, schema, media, security, and operational capabilities belong in Axis or backend services and require proper authorization.",
            "Public documentation routes must not be used to infer access to private customer, tenant, employee, environment, or provider data.",
            "Nodics may change, suspend, restrict, or remove access to public preview features, documentation, or demo endpoints to protect security, availability, legal compliance, or product integrity.",
          ],
        },
        {
          title: "No warranty and limitation of liability",
          body: "Nexus content is provided for information, evaluation, and product communication.",
          items: [
            "Public content, local preview behavior, examples, roadmaps, reference applications, and generated documentation may change without notice.",
            "Except where a signed agreement states otherwise, materials are provided without implied warranties of merchantability, fitness for a particular purpose, non-infringement, availability, accuracy, or uninterrupted operation.",
            "To the maximum extent allowed by applicable law and any governing written agreement, Nodics is not liable for indirect, incidental, consequential, special, punitive, or lost-profit damages arising from use of the public website.",
          ],
        },
        {
          title: "Security reporting and responsible disclosure",
          body: "Security reports should follow the Nodics security policy.",
          items: [
            "Report vulnerabilities through the agreed Nodics support or security contact.",
            "Do not publish exploit details before Nodics has triaged tenant impact, enterprise scope, and remediation timing.",
            "Security fixes must preserve tenant scope, service-token and human-token boundaries, route authorization, private media controls, audit records, and module ownership.",
          ],
        },
      ],
      href: "mailto:nodics.framework@gmail.com",
      linkLabel: "Contact Nodics about terms",
    },
  },
  record48: {
    code: "nexusCookiesContent",
    typeCode: "nexusContentSectionType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Cookie Policy",
      heading:
        "Nexus should use browser storage only when it has a clear purpose.",
      body: "This policy explains how Nodics Nexus may use cookies, local storage, and similar technologies. The local reference site is designed to avoid marketing cookies by default. Production configuration must match the actual analytics, consent, security, and preference tools that are deployed.",
      summary:
        "Nexus should use browser storage only when it improves the visitor experience, protects the service, or supports requested functionality.",
      effectiveLabel: "Cookie approach",
      effectiveDate:
        "Essential first · transparent choices · no hidden tracking",
      policyHighlights: [
        {
          label: "Essential use",
          value:
            "Required storage supports routing, security, and requested functionality",
        },
        {
          label: "Analytics",
          value:
            "Analytics should be disclosed and consented to where required",
        },
        {
          label: "Visitor control",
          value: "Non-essential cookies should remain explainable and optional",
        },
      ],
      policySections: [
        {
          title: "What cookies are",
          body: "Cookies are small files stored by a browser. Similar technologies include local storage, session storage, pixels, and device or browser identifiers.",
          items: [
            "They can help a site remember a preference, keep a session secure, measure usage, or protect against abuse.",
            "Some cookies are necessary for a requested service. Others, such as analytics or advertising cookies, may require consent depending on jurisdiction and configuration.",
            "Nexus should describe cookies in plain language before non-essential cookies are used.",
          ],
        },
        {
          title: "How Nexus uses storage today",
          body: "The local Nexus public site is intended to run as a content, documentation, and API reference experience with no marketing cookies by default.",
          items: [
            "Essential technical storage may be used by browser, hosting, security, or application infrastructure to deliver the page, route requests, prevent abuse, or preserve basic state.",
            "Axis, authenticated administration, or backend services may use separate cookies or tokens for login, CSRF protection, session refresh, and authorized work. Those controls belong to the authenticated application experience, not public marketing tracking.",
            "Public API reference and documentation views should remain view-only unless the user moves into an authenticated system.",
          ],
        },
        {
          title: "Possible production cookie categories",
          body: "If enabled in production, cookies or similar technologies should be grouped by purpose and disclosed clearly.",
          items: [
            "Strictly necessary: security, routing, load balancing, consent record, basic preferences, and service delivery requested by the visitor.",
            "Preferences: language, region, display, or documentation view settings when the visitor chooses to save them.",
            "Analytics: aggregated site usage, documentation engagement, search terms, page performance, and error visibility to improve Nexus.",
            "Marketing or third-party embeds: only if explicitly approved and disclosed for production; not part of the local reference baseline.",
          ],
        },
        {
          title: "Consent and control",
          body: "Visitors should have practical control over non-essential cookies.",
          items: [
            "Non-essential analytics or marketing cookies should not load until the visitor has been given clear information and, where required, has consented.",
            "Refusing non-essential cookies should not prevent access to core Nexus pages, documentation, or public API reference.",
            "Visitors can also delete or block cookies through browser settings, though blocking necessary cookies may affect some requested services.",
            "Consent withdrawal should be as easy as consent acceptance once production consent tooling is enabled.",
          ],
        },
        {
          title: "Third-party services",
          body: "Nexus may link to or embed services such as GitHub, documentation tools, analytics, hosting, monitoring, maps, video, or social links.",
          items: [
            "Third-party services may set their own cookies when you visit their sites or interact with embedded content.",
            "Nodics does not control third-party cookie practices outside Nodics-managed services.",
            "Production policy must list approved third-party cookie providers and explain their purpose, duration, and control options.",
          ],
        },
        {
          title: "Production governance",
          body: "Cookie behavior is deployment-specific and must stay aligned with the actual runtime.",
          items: [
            "Before production launch, validate the deployed site with browser inspection and consent tooling to confirm no undeclared cookies are set.",
            "Update this policy whenever analytics, advertising, embeds, consent tooling, hosting, or authenticated-domain behavior changes.",
            "Keep cookie choices consistent with the Privacy Policy, security policy, and any customer, partner, or data-processing agreement.",
          ],
        },
      ],
      href: "mailto:nodics.framework@gmail.com",
      linkLabel: "Ask about cookies",
    },
  },
  record49: {
    code: "nexusEditorialListing",
    typeCode: "nexusEditorialListingType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics editorial",
      heading: "News and insights",
      articles: [
        {
          code: "nodics-framework-insights",
          contentTypeCode: "BLOG",
          title: "Nodics framework thinking for AI-era delivery.",
          summary:
            "A public editorial overview connecting AI-assisted development, scalability beyond servers, architecture ownership, and governed release readiness.",
          href: "/blog/nodics-framework-insights",
        },
      ],
    },
  },
  record50: {
    code: "nexusEditorialDetail",
    typeCode: "nexusEditorialDetailType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      contentTypeCode: "BLOG",
      category: "Nodics Framework",
      date: "2026-08-29",
      author: "Nodics Architecture Team",
      title: "Nodics framework thinking for AI-era delivery.",
      summary:
        "A public editorial overview connecting AI-assisted development, scalability beyond servers, architecture ownership, and governed release readiness.",
      bodyText:
        "The Nexus editorial surface now explains real Nodics framework themes instead of sample website placeholders. The public articles describe one connected idea: AI can speed up application creation, but durable enterprise software still needs architecture, ownership, governance, runtime evidence, and a path to scale.\n\nThat message belongs on Nexus because the website is not only a marketing surface. It is a public proof of how Nodics thinks about content ownership, publication, routing, component composition, and Online delivery. The same architecture language that explains the framework should also shape how the site itself is built.\n\nFor visitors, the editorial section should make the Nodics position easy to understand: start fast, preserve the speed of AI-assisted delivery, but do not wait until the product is already under pressure to ask how security, tenancy, integrations, auditability, resilience, observability, and change will work.",
      sections: [
        {
          title: "Why Nexus needs real editorial content",
          body: "A production-ready framework site should not depend on placeholder stories. News and Blogs are part of how architects, founders, partners, and operators understand what Nodics is trying to solve.",
        },
        {
          title: "What the current series explains",
          body: "The first public themes connect AI-assisted application generation, scalability beyond infrastructure, and the need for architecture before success exposes weak foundations.",
        },
        {
          title: "How Nodics carries the message",
          body: "Nexus renders the public experience, but the content remains governed through records, routes, components, localization, manifests, and expected Online projections.",
        },
      ],
      takeaways: [
        "Nexus content should explain the real Nodics framework position.",
        "AI-era speed needs a path into enterprise architecture.",
        "Governed content delivery is part of the production story.",
      ],
    },
  },
  record51: {
    code: "nexusAboutMvpScale",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "about-mvp-scale",
      kicker: "From MVP to scale",
      heading: "AI can create an MVP quickly. Nodics helps make it scalable.",
      body: "Vibe coding and AI-assisted development can prove an idea fast, but many MVPs reach their limit when teams need tenants, security, integrations, admin controls, auditability, documentation, and repeatable deployment. Nodics keeps that speed while adding the contracts a real product needs.",
      items: [
        {
          symbol: "MVP",
          title: "Fast prototypes often hide future risk",
          text: "A working demo can still have mixed responsibilities, direct data access, weak extension boundaries, missing tests, and no clear operations model.",
        },
        {
          symbol: "N",
          title: "Nodics adds the missing foundation",
          text: "Reusable modules, schemas, APIs, imports, documentation, Axis administration, and runtime composition make ownership visible before the product grows.",
        },
        {
          symbol: "SCL",
          title: "Teams scale without throwing the MVP away",
          text: "Keep the validated customer journey, then move implementation into governed modules, configurable data, secure services, and project-owned extensions.",
        },
      ],
      href: "/docs",
      linkLabel: "Read the framework guide",
    },
  },
  record52: {
    code: "nexusFeaturesPillars",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "feature-pillars",
      kicker: "Capability pillars",
      heading: "The platform blocks that make Nodics different.",
      body: "Nodics is not only a codebase. It is a set of reusable business and operational contracts that help teams move from idea to governed delivery without losing clarity.",
      items: [
        {
          symbol: "MOD",
          title: "Modular by contract",
          text: "Functional modules define capability ownership while technical modules provide implementation, configuration, APIs, imports, documentation, and tests.",
        },
        {
          symbol: "AI",
          title: "AI-assisted delivery",
          text: "AI can inspect framework context, generated contracts, documentation, and runtime behavior while humans keep authority over architecture and release decisions.",
        },
        {
          symbol: "AX",
          title: "BackOffice built in",
          text: "Axis gives operators and developers a governed control plane for modules, schemas, CMS, imports, API reference, documentation, and recovery.",
        },
        {
          symbol: "CMS",
          title: "Composable content",
          text: "Sites, catalogs, pages, slots, components, sub-components, media references, routes, and renderers are backend-managed data, not hidden frontend constants.",
        },
        {
          symbol: "API",
          title: "Discoverable APIs",
          text: "OpenAPI contracts and runtime API grouping make backend capabilities easier to inspect, document, secure, and reuse across applications.",
        },
        {
          symbol: "REL",
          title: "Release-safe data",
          text: "Content packs, documentation packs, checksums, import status, and environment releases make data movement visible instead of accidental.",
        },
      ],
    },
  },
  record53: {
    code: "nexusFeaturesArchitecture",
    typeCode: "nexusContentSectionType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "feature-architecture",
      kicker: "Architecture advantage",
      heading:
        "Built for reuse without forcing customer projects into a framework fork.",
      body: "Most enterprise delivery slows down when common capabilities and customer-specific behavior become tangled. Nodics keeps reusable framework contracts, operational tools, content data, and project-owned customization at clear boundaries.",
      detailItems: [
        {
          eyebrow: "Ownership",
          title: "Every capability has a home.",
          text: "Core, Platform, WCMS, Process, Commerce, Communication, Engagement, Axis, Kickoff, and Nexus each own a clear part of the delivery model.",
        },
        {
          eyebrow: "Extension",
          title: "Customize after the framework, not inside it.",
          text: "Customer modules can extend or override behavior through runtime load order while the standard functional capability remains recognizable.",
        },
        {
          eyebrow: "Evidence",
          title: "Contracts stay inspectable.",
          text: "Schemas, APIs, imports, documentation, routes, and release manifests give teams and AI tools evidence before they change production behavior.",
        },
      ],
      metrics: [
        {
          value: "Core",
          label: "Reusable framework base",
        },
        {
          value: "Axis",
          label: "Operational control plane",
        },
        {
          value: "Nexus",
          label: "Public and demo experience",
        },
      ],
      referenceImageCode: "nodicsMicroservicesHero",
      imageAlt:
        "Connected enterprise services representing Nodics capability ownership",
    },
  },
  record54: {
    code: "nexusFeaturesCapabilities",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "feature-capabilities",
      kicker: "Capability catalogue",
      heading:
        "Enterprise features that belong together, but remain independently owned.",
      body: "Nodics gives partners a broader foundation than a website template, a CMS, or a generated MVP. The capabilities are designed to compose into real customer journeys.",
      items: [
        {
          symbol: "ID",
          title: "Identity and profile",
          text: "Employee authentication, profile services, tenant and enterprise scope, and BackOffice bootstrap contracts.",
        },
        {
          symbol: "SCH",
          title: "Schema workbench",
          text: "Runtime-visible models and schemas help teams inspect contracts before adding data, APIs, or UI behavior.",
        },
        {
          symbol: "IMP",
          title: "Imports and exports",
          text: "Governed bootstrap, content, sample, documentation, and environment data releases with immutable checksums.",
        },
        {
          symbol: "DOC",
          title: "Runtime documentation",
          text: "Framework, Axis, Kickoff, and API documentation are shipped as owned content packs and rendered through Axis or Nexus.",
        },
        {
          symbol: "MED",
          title: "Media governance",
          text: "Media references, asset lifecycle, public/private boundaries, and CMS rendering rules stay governed by backend ownership.",
        },
        {
          symbol: "LOC",
          title: "Localization-ready design",
          text: "Content, media, routes, and stable keys are prepared for future multilingual rendering without hardcoding language assumptions.",
        },
        {
          symbol: "COM",
          title: "Commerce foundation",
          text: "Catalog, pricing, promotion, inventory, cart, checkout, order, fulfillment, tax, and customer journeys can compose into a demo storefront.",
        },
        {
          symbol: "PRC",
          title: "Process and workflow",
          text: "Process-aware business journeys can coordinate human and system work across long-running operations.",
        },
        {
          symbol: "MSG",
          title: "Communication",
          text: "Notification and messaging capabilities can serve multiple domains without becoming owned by any one customer journey.",
        },
        {
          symbol: "ENG",
          title: "Engagement",
          text: "Contact, testimonial, editorial, customer-interaction, and public projection data can be separated from internal records.",
        },
        {
          symbol: "SEC",
          title: "Security controls",
          text: "Authorization, token boundaries, route exposure, tenant scope, private media, and audit-sensitive operations remain explicit.",
        },
        {
          symbol: "OPS",
          title: "Operational visibility",
          text: "Module registry, runtime status, documentation release state, recovery modes, and API groups make local and production behavior easier to trust.",
        },
      ],
      href: "/docs",
      linkLabel: "Read framework documentation",
    },
  },
  record55: {
    code: "nexusFeaturesMvpScale",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "feature-mvp-scale",
      kicker: "MVP to scale",
      heading:
        "Keep AI speed. Add enterprise structure before the product outgrows the prototype.",
      body: "AI and vibe coding can prove an idea quickly. Nodics helps teams keep that momentum while adding the contracts needed for tenancy, security, administration, integrations, auditability, documentation, and repeatable releases.",
      items: [
        {
          symbol: "01",
          title: "Start with a working reference",
          text: "Run framework, Kickoff, Axis, and Nexus locally so the team sees an end-to-end system before writing customer-specific code.",
        },
        {
          symbol: "02",
          title: "Move custom work into the right owner",
          text: "Keep reusable framework capability separate from project-owned modules, content data, storefront renderers, and integration adapters.",
        },
        {
          symbol: "03",
          title: "Scale with evidence",
          text: "Use schemas, OpenAPI, documentation, import manifests, tests, and Axis workbenches to make growth reviewable instead of mysterious.",
        },
      ],
      href: "/about#about-mvp-scale",
      linkLabel: "See the Nodics approach",
    },
  },
  record56: {
    code: "nexusFeaturesJourney",
    typeCode: "nexusContentSectionType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "feature-journey",
      kicker: "Partner journey",
      heading: "From downloaded framework to customer-ready foundation.",
      body: "A developer or partner should be able to clone the Nodics repositories, run the reference runtime, open Axis, view Nexus, inspect documentation and APIs, then rename and customize the project for a real customer journey.",
      detailItems: [
        {
          eyebrow: "Run",
          title: "Start the reference system locally.",
          text: "Kickoff starts the backend runtime and data; Axis opens the control plane; Nexus shows the public and demo-facing experience.",
        },
        {
          eyebrow: "Understand",
          title: "Inspect the contracts before changing them.",
          text: "Use documentation, API reference, module registry, schema workbench, CMS components, and imports to understand ownership.",
        },
        {
          eyebrow: "Customize",
          title: "Rename, extend, and integrate for the customer.",
          text: "Keep customer-specific integrations such as payment, fulfillment, identity providers, or operational processes in project-owned modules.",
        },
      ],
      metrics: [
        {
          value: "4",
          label: "Reference repositories",
        },
        {
          value: "1",
          label: "End-to-end local journey",
        },
        {
          value: "0",
          label: "Need for hidden framework forks",
        },
      ],
      href: "/contact",
      linkLabel: "Start a conversation",
      referenceImageCode: "nodicsDeveloperExperience",
      imageAlt: "Developer working with a governed Nodics reference workspace",
    },
  },
  record60: {
    code: "nexusSupportPaths",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "support-paths",
      kicker: "Support paths",
      heading: "Choose the path that matches the stage of your journey.",
      body: "Different teams need different help. Evaluation questions, implementation planning, launch readiness, and operational incidents should not be handled through the same loose channel.",
      items: [
        {
          symbol: "01",
          title: "Community and public material",
          text: "Best for learning the framework, reading documentation, inspecting APIs, reviewing examples, and raising non-urgent public questions or issues.",
        },
        {
          symbol: "02",
          title: "Developer enablement",
          text: "Best for partners who need setup help, architecture review, extension guidance, content modelling, and module ownership decisions.",
        },
        {
          symbol: "03",
          title: "Commercial support contract",
          text: "Best when a customer or partner needs named contacts, agreed channels, prioritization, escalation, and response expectations for active delivery or operation.",
        },
      ],
    },
  },
  record61: {
    code: "nexusSupportResponseModel",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "support-response-model",
      kicker: "Response expectations",
      heading: "Prioritize by business impact, not noise.",
      body: "Public channels remain best effort. Contracted support defines the supported environments, authorized contacts, response windows, escalation route, and exclusions before the first urgent ticket appears.",
      items: [
        {
          symbol: "P1",
          title: "Critical production interruption",
          text: "A live customer journey is unavailable or materially unsafe. Contracted response is handled through the agreed urgent channel with restoration as the first objective.",
        },
        {
          symbol: "P2",
          title: "High delivery or operation blocker",
          text: "A release, integration, data import, admin capability, or operational process is blocked and needs prioritized triage with a named owner.",
        },
        {
          symbol: "P3",
          title: "Standard guidance or defect",
          text: "A question, defect, enhancement, or design concern can be reviewed through normal support cadence, documentation updates, or backlog planning.",
        },
        {
          symbol: "P4",
          title: "Community and learning",
          text: "General usage, roadmap, examples, and exploration topics are handled through public documentation and community-style conversation where no SLA is implied.",
        },
      ],
    },
  },
  record62: {
    code: "nexusSupportRequestChecklist",
    typeCode: "nexusContentSectionType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "support-request-checklist",
      kicker: "Before raising a request",
      heading: "Good evidence makes support faster.",
      body: "Support works best when the request includes enough context for Nodics, partners, and customer teams to reproduce the issue, understand the impact, and decide who owns the next action.",
      detailItems: [
        {
          eyebrow: "Context",
          title: "Tell us what is affected.",
          text: "Include the project, repository, branch, runtime server, module, environment, user role, page or API, and business impact.",
        },
        {
          eyebrow: "Evidence",
          title: "Share what changed.",
          text: "Attach steps to reproduce, screenshots, logs, correlation IDs, content-pack versions, import status, API contract details, and expected versus actual behavior.",
        },
        {
          eyebrow: "Boundary",
          title: "Identify likely ownership.",
          text: "Call out whether the issue appears in Nodics framework capability, Kickoff data/runtime, Axis administration, Nexus rendering, or customer-owned customization.",
        },
      ],
      metrics: [
        {
          value: "Impact",
          label: "priority input",
        },
        {
          value: "Evidence",
          label: "faster triage",
        },
        {
          value: "Owner",
          label: "clear next step",
        },
      ],
      href: "/contact",
      linkLabel: "Start a support conversation",
      referenceImageCode: "nodicsDeveloperExperience",
      imageAlt:
        "Developer preparing reproducible support evidence for a Nodics request",
    },
  },
  record63: {
    code: "nexusSupportBoundaries",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "support-boundaries",
      kicker: "Support boundaries",
      heading: "Know what Nodics supports, and what the project owns.",
      body: "Clear support boundaries prevent frustration. Nodics can help with framework contracts and reference experiences, while customer-specific integrations and production policies remain with the implementing project unless a contract says otherwise.",
      items: [
        {
          symbol: "N",
          title: "Nodics foundation",
          text: "Framework modules, schema contracts, content-pack import behavior, API metadata, reference setup, documentation structure, and reusable runtime patterns.",
        },
        {
          symbol: "AX",
          title: "Axis and operations",
          text: "Administrative visibility, module registration, workbenches, documentation delivery, content management behavior, and operator-facing diagnostics.",
        },
        {
          symbol: "CX",
          title: "Customer-owned extensions",
          text: "Payment, fulfillment, identity-provider setup, hosting, analytics, local policy, branding, custom integrations, and business-specific process decisions.",
        },
      ],
      href: "/contact",
      linkLabel: "Discuss a support contract",
    },
  },
  record64: {
    code: "nexusNewsListingHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics News",
      heading: "Official Nodics framework updates.",
      breadcrumbLabel: "News",
      body: "Track published Nodics thinking on AI-assisted delivery, scalability, architecture, and the framework path from prototype to enterprise scale.",
      referenceImageCode: "nexusNewsPublicExperience",
      imageAlt: "Enterprise team reviewing Nodics news and platform updates",
    },
  },
  record65: {
    code: "nexusNewsListing",
    typeCode: "nexusEditorialListingType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "News index",
      heading: "Searchable release and platform updates.",
      body: "Use grid view for scanning or list view for deeper review. Filters and search operate on the public editorial projection that Nexus is allowed to render.",
      contentTypeCode: "NEWS",
      defaultView: "grid",
      searchPlaceholder: "Search news by title, summary, tag, or module",
      emptyMessage: "No news matched the selected filters.",
      articles: [
        {
          code: "nexus-news-public-experience",
          contentTypeCode: "NEWS",
          category: "AI Architecture",
          date: "2026-08-26",
          special: true,
          specialLabel: "Featured release",
          specialRank: 10,
          specialFrom: "2026-08-11T00:00:00.000Z",
          specialUntil: null,
          specialVariant: "gold",
          title:
            "Nodics publishes new article on architecture behind AI-built applications.",
          summary:
            "The latest Nodics framework article explains why AI-built applications still need architecture, ownership, resilience, and governance when success arrives.",
          href: "/news/ai-built-application-who-built-architecture",
          referenceImageCode: "nexusNewsPublicExperience",
          imageAlt:
            "Governed public Nexus experience connected to backend content",
          tags: ["AI", "Architecture", "Nodics"],
        },
        {
          code: "nexus-news-axis-business-journey",
          contentTypeCode: "NEWS",
          category: "Scalability",
          date: "2026-08-22",
          special: false,
          title:
            "Scalability article reframes growth as users, domains, teams, and time.",
          summary:
            "A new Nodics article argues that scalable software must grow across roles, permissions, business complexity, integrations, teams, security, and time.",
          href: "/news/scalability-beyond-servers-users-domains-teams-time",
          referenceImageCode: "nexusNewsAxisRuntime",
          imageAlt:
            "Axis BackOffice capability connected to registered runtime modules",
          tags: ["Scalability", "Domains", "Teams"],
        },
        {
          code: "nexus-news-engagement-public-api",
          contentTypeCode: "NEWS",
          category: "AI Foundation",
          date: "2026-08-18",
          special: false,
          title:
            "Nodics thinking connects AI-assisted software with enterprise foundations.",
          summary:
            "The first article in the series asks how AI-generated applications can graduate from fast prototypes into serious businesses.",
          href: "/news/ai-assisted-software-needs-enterprise-foundations",
          referenceImageCode: "nexusNewsEngagementApi",
          imageAlt:
            "Engagement public APIs connecting Nexus contact and testimonial journeys",
          tags: ["AI", "Foundation", "Enterprise"],
        },
        {
          code: "nexus-news-editorial-release-flow",
          contentTypeCode: "NEWS",
          category: "Nexus",
          date: "2026-08-29",
          special: false,
          title:
            "Nexus News and Blogs now carry Nodics framework thought leadership.",
          summary:
            "Sample editorial placeholders are being replaced with governed Nexus content based on public Nodics framework articles and production-ready themes.",
          href: "/news/nexus-news-blogs-carry-nodics-framework-thinking",
          referenceImageCode: "nexusNewsEditorialRelease",
          imageAlt:
            "Governed editorial release flow for news and blog publishing",
          tags: ["Nexus", "Editorial", "Publishing"],
        },
      ],
    },
  },
  record66: {
    code: "nexusNewsPublicExperienceHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics News",
      heading: "Architecture behind AI-built applications.",
      breadcrumbLabel: "News",
      body: "A new Nodics framework article asks what happens after AI has generated the first working application.",
      referenceImageCode: "nexusNewsPublicExperience",
      imageAlt: "Governed public Nexus experience connected to backend content",
    },
  },
  record67: {
    code: "nexusNewsPublicExperienceDetail",
    typeCode: "nexusEditorialDetailType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      contentTypeCode: "NEWS",
      category: "AI Architecture",
      date: "2026-08-26",
      author: "Himkar Dwivedi",
      title:
        "Nodics publishes new article on architecture behind AI-built applications.",
      summary:
        "The latest Nodics framework article explains why AI-built applications still need architecture, ownership, resilience, and governance when success arrives.",
      referenceImageCode: "nexusNewsPublicExperience",
      imageAlt: "Governed public Nexus experience connected to backend content",
      bodyText:
        "A new Nodics framework article has been published by Himkar Dwivedi, focusing on one of the most important questions in the AI-assisted development era: what happens after the application is built?\n\nAI tools can now help founders, product teams, and developers move from idea to working product with extraordinary speed. Interfaces can be generated, authentication can be wired, dashboards can appear, data can be stored, and an application can reach real users faster than most teams would have believed a few years ago.\n\nThat speed is valuable. It should not be slowed down. But success changes the engineering problem. When customers arrive, transactions grow, teams expand, and enterprise customers ask for trust, recovery, auditability, and governance, the question is no longer only whether the application works. The question becomes whether the architecture underneath it can support the business that the application is becoming.\n\nThe article uses the language of startup success deliberately. Unexpected growth is usually celebrated, but it also exposes the system beneath the product. The first release proves demand. The second stage asks whether demand can be served reliably. A product can be loved by customers and still become fragile if availability, data ownership, tenant isolation, retry behavior, release discipline, and operational accountability were not part of the path from the beginning.\n\nThis is why the article connects AI-era application speed with architecture. AI may reduce the cost of building the first version, but it does not remove the need to decide who owns each domain, how APIs evolve, how failed transactions recover, how changes are audited, how teams work independently, and how a business keeps moving when one capability is under pressure.\n\nFor Nodics, the answer is not to force every new idea into heavy enterprise ceremony. The more useful answer is to give fast applications a path to future scale. A team should be able to start simply, validate quickly, and still have foundations for security, events, configuration, observability, publication, integration, and governance when the product begins to matter.",
      sections: [
        {
          title: "Success changes the questions",
          body: "Early product questions are correctly focused on speed: can we build it, can we show it, can we release it, and will anyone care? Once the product proves demand, the questions move to a different level. Can the system remain available under sudden demand? Can a failed transaction be retried safely? Can tenants be isolated? Can teams change separate capabilities without breaking each other? Can operators explain who changed what and why? Those questions are not cosmetic. They define whether success becomes momentum or a painful engineering interruption.",
        },
        {
          title: "AI shortens the runway",
          body: "AI-assisted development compresses the time between idea, prototype, application, and customer. That is the opportunity. It also means architectural complexity can arrive much earlier in the company journey, sometimes before the team has formalized ownership boundaries, event flows, integration patterns, operational evidence, or data governance. In that world, architecture is no longer a late-stage luxury. It becomes the path that keeps rapid delivery from becoming a fragile pile of successful experiments.",
        },
        {
          title: "Nodics foundation",
          body: "Nodics is being shaped around the path between speed today and architecture tomorrow. Reusable module boundaries, API contracts, publication control, runtime evidence, configuration, security, integration, and governance patterns give an AI-built or manually-built application somewhere to grow when the first version becomes a serious business system. The point is not to celebrate complexity. The point is to make the foundations visible before the business depends on hidden assumptions.",
        },
      ],
      takeaways: [
        "AI can accelerate implementation, but it does not remove architecture.",
        "Successful products need ownership, resilience, tenancy, and auditability.",
        "Nodics gives fast applications a path toward enterprise foundations.",
      ],
      href: "/news",
      linkLabel: "Back to News",
    },
  },
  record68: {
    code: "nexusNewsAxisBusinessJourneyHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics News",
      heading: "Scalability beyond infrastructure.",
      breadcrumbLabel: "News",
      body: "The Nodics framework series reframes scale as a business, domain, team, security, and time problem.",
      referenceImageCode: "nexusNewsAxisRuntime",
      imageAlt:
        "Axis BackOffice capability connected to registered runtime modules",
    },
  },
  record69: {
    code: "nexusNewsAxisBusinessJourneyDetail",
    typeCode: "nexusEditorialDetailType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      contentTypeCode: "NEWS",
      category: "Scalability",
      date: "2026-08-22",
      author: "Himkar Dwivedi",
      title:
        "Scalability article reframes growth as users, domains, teams, and time.",
      summary:
        "A new Nodics article argues that scalable software must grow across roles, permissions, business complexity, integrations, teams, security, and time.",
      referenceImageCode: "nexusNewsAxisRuntime",
      imageAlt:
        "Axis BackOffice capability connected to registered runtime modules",
      bodyText:
        "The Nodics framework series now includes a public article that reframes scalability as more than infrastructure capacity. More servers, faster databases, and stronger cloud platforms matter, but they solve only part of the scale problem.\n\nA business application can handle millions of requests and still become difficult to scale if its roles are too simple, its domain model cannot evolve, its integrations are fragile, or its teams cannot change separate parts of the system independently. At that point, the bottleneck is not only traffic. It is architecture, ownership, business complexity, governance, and time.\n\nFor Nodics, this distinction matters because the framework is not only a runtime container. It is a way to keep capability boundaries, publication flows, public delivery contracts, and operational evidence visible before growth turns hidden assumptions into expensive rewrites.\n\nThe article starts with a common assumption: a scalable application is one that can handle more users. That definition is useful, but incomplete. Real scale also means new employee roles, partner access, supplier operations, support workflows, audit expectations, regional rules, tenant-level visibility, and policy controls. A simple application might survive load testing while still being unprepared for the social and operational shape of a growing business.\n\nThe same pattern appears in domains and integrations. What begins as product, cart, and order becomes variants, bundles, localization, contract prices, taxes, currencies, payments, fulfillment, cancellations, returns, refunds, warehouses, CRMs, ERPs, identity providers, and partner APIs. Every added boundary introduces failure modes, ownership questions, and recovery requirements.\n\nNodics treats that broader definition of scale as a design input. Scalability must include how teams change modules independently, how APIs are versioned, how publishable data moves through approval, how runtime capability is discovered, and how operators see evidence that the public application is safe to serve.",
      sections: [
        {
          title: "Users and policies scale",
          body: "A simple product may start with an administrator and a customer. A real business often grows into employees, suppliers, managers, support agents, auditors, partners, and tenant administrators. A boolean admin flag cannot carry that world. Roles, permissions, policies, ownership boundaries, and data isolation become part of scalability because the system must scale with responsibility, not only with traffic.",
        },
        {
          title: "Domains and integrations scale",
          body: "Business growth turns simple flows into product variants, contracts, taxes, fulfillment, refunds, external systems, retries, and failure handling across boundaries. A simple product, cart, and order path becomes a multi-domain system with pricing, payment, inventory, customer service, and operational responsibilities. The architecture must make those domains understandable before they become tangled inside one application surface.",
        },
        {
          title: "Change must scale",
          body: "The real scalability test is not only whether the application can run today. It is whether several teams can safely change it three years from now. Clear module ownership, API versioning, runtime discovery, deployment discipline, and publication evidence let people and software evolve independently instead of turning every change into shared risk. That is why scalability belongs to architecture and operating model as much as infrastructure.",
        },
      ],
      takeaways: [
        "Scalability is broader than infrastructure capacity.",
        "Roles, domains, integrations, and teams need explicit architecture.",
        "Nodics treats long-term change as part of the scale problem.",
      ],
      href: "/news",
      linkLabel: "Back to News",
    },
  },
  record70: {
    code: "nexusNewsEngagementPublicApiHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics News",
      heading: "AI-assisted software needs enterprise foundations.",
      breadcrumbLabel: "News",
      body: "Fast application generation is powerful, but successful products need foundations that preserve speed as complexity grows.",
      referenceImageCode: "nexusNewsEngagementApi",
      imageAlt:
        "Engagement public APIs connecting Nexus contact and testimonial journeys",
    },
  },
  record71: {
    code: "nexusNewsEngagementPublicApiDetail",
    typeCode: "nexusEditorialDetailType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      contentTypeCode: "NEWS",
      category: "AI Foundation",
      date: "2026-08-18",
      author: "Himkar Dwivedi",
      title:
        "Nodics thinking connects AI-assisted software with enterprise foundations.",
      summary:
        "The first article in the series asks how AI-generated applications can graduate from fast prototypes into serious businesses.",
      referenceImageCode: "nexusNewsEngagementApi",
      imageAlt:
        "Engagement public APIs connecting Nexus contact and testimonial journeys",
      bodyText:
        "The first article in the Nodics framework series responds to a very real shift in software development. A few years ago, a working application often required weeks or months of planning, design, coding, deployment, and iteration. Today, AI-assisted tools can help turn a plain-language idea into a polished, running product in hours.\n\nThat is not a small productivity improvement. It changes who can experiment, how quickly founders can validate ideas, and how directly business users can participate in creation. The article does not argue against that movement. It argues that the next stage needs equal attention.\n\nWhen an AI-assisted application succeeds, it begins to encounter the same enterprise responsibilities as any other serious system: authorization, multitenancy, API contracts, configuration, events, distributed transactions, caching, observability, auditability, resilience, integration, data governance, extension models, and deployment governance. Nodics exists in that space between rapid application generation and durable application engineering.\n\nThe important point is that the definition of working software changes as the stakes change. A prototype works when a few people can use it and understand the idea. A business system works when it can protect customer history, serve multiple roles, recover from failure, survive integration outages, support compliance questions, and keep evolving after many teams have touched it.\n\nAI can generate a coupon screen, a dashboard, a data model, or an API with impressive speed. But mature commerce, engagement, publishing, identity, and operational systems have deeper questions: how rules are versioned, what happens when downstream systems fail, how retries avoid duplication, how tenants are isolated, and how audit history proves responsibility.\n\nThat is why Nodics frames AI-assisted delivery as the beginning of a stronger application lifecycle, not a shortcut around engineering. The best future is not one where builders must choose between speed and architecture. It is one where fast application generation can stand on reusable enterprise foundations from the first serious step.",
      sections: [
        {
          title: "Speed should be preserved",
          body: "The goal is not to slow down AI builders. The goal is to keep their speed while avoiding a painful rewrite when the application starts serving real customers. Faster creation should mean more validated ideas, not more fragile systems waiting for their first serious growth event. Nodics should help a project keep moving without pretending that serious business requirements will never arrive.",
        },
        {
          title: "Enterprise concerns repeat",
          body: "A generated feature can look complete while still hiding unresolved domain questions. A coupon screen is easy to create; promotion versioning, contract pricing, inventory changes between cart and payment, audit history, tenant-specific rules, and downstream notifications require architectural decisions. The distinction matters because the screen is only the visible edge of a domain responsibility.",
        },
        {
          title: "Applications can graduate",
          body: "Nodics is shaped around the idea that AI-built applications can move from idea to MVP to customer adoption and then into durable enterprise software. The framework should let teams focus on what makes the product different instead of repeatedly solving authentication, configuration, events, auditing, tenancy, integrations, and deployment governance from scratch. That graduation path is the practical bridge between vibe coding and enterprise engineering.",
        },
      ],
      takeaways: [
        "AI can hide much of the coding, but complexity still moves somewhere.",
        "Enterprise foundations keep fast delivery from becoming fragile delivery.",
        "Nodics connects AI-assisted speed with governed application engineering.",
      ],
      href: "/news",
      linkLabel: "Back to News",
    },
  },
  record72: {
    code: "nexusNewsEditorialReleaseFlowHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics News",
      heading: "Nexus editorial content now reflects Nodics thinking.",
      breadcrumbLabel: "News",
      body: "The News and Blogs sections are moving away from placeholder examples toward real framework thought leadership.",
      referenceImageCode: "nexusNewsEditorialRelease",
      imageAlt: "Governed editorial release flow for news and blog publishing",
    },
  },
  record73: {
    code: "nexusNewsEditorialReleaseFlowDetail",
    typeCode: "nexusEditorialDetailType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      contentTypeCode: "NEWS",
      category: "Nexus",
      date: "2026-08-29",
      author: "Nodics Editorial Team",
      title:
        "Nexus News and Blogs now carry Nodics framework thought leadership.",
      summary:
        "Sample editorial placeholders are being replaced with governed Nexus content based on public Nodics framework articles and production-ready themes.",
      referenceImageCode: "nexusNewsEditorialRelease",
      imageAlt: "Governed editorial release flow for news and blog publishing",
      bodyText:
        "Nexus News and Blogs now move away from generic sample content and begin carrying the public thinking behind the Nodics framework. The immediate change is editorial, but the reason is architectural: a production public site should explain the actual framework, not temporary placeholder stories.\n\nThe new content is shaped around three connected ideas from the published article series. First, AI-assisted development is making application creation dramatically faster. Second, scalability is broader than servers and traffic. Third, applications that succeed need a path from prototype speed to architecture, governance, observability, resilience, and long-term change.\n\nThis update keeps those ideas inside the existing Nodics delivery model. Nexus renders public content; WCMS and Editorial records carry the governed source; routes and component composition define the experience; manifest hashes make the data-pack change inspectable; Online projections remain aligned with authoring and localization.\n\nThe production readiness point is simple: sample editorial content is useful while proving a renderer, but it becomes a liability when the public site is trying to explain a real framework. A visitor should be able to open News or Blogs and understand what Nodics believes about AI-era delivery, why architecture still matters, and how governed publication fits the product story.\n\nThe change also keeps content ownership honest. The frontend should not become the article database. It should render the public experience from governed records, while the customer project supplies release data and WCMS/Editorial projections carry the publishable truth. That distinction lets the content improve without rewriting the renderer.\n\nThis release therefore does two jobs. It makes the public copy more serious, and it proves that Nexus can carry long-form framework thinking through the same data-driven path used for pages, media references, navigation, routes, and shared site shell composition.",
      sections: [
        {
          title: "What changed",
          body: "The previous sample-style editorial cards have been replaced with Nodics-specific News and Blog records. The pages now speak about AI-built applications, enterprise foundations, scalability beyond servers, architecture ownership, and governed scale. The detail pages now need to read like actual public thought leadership, not only like card summaries expanded by a few lines.",
        },
        {
          title: "Why it matters",
          body: "Nexus is the public surface for the framework. If the public site uses generic sample content, visitors cannot understand the problem Nodics is solving. Real editorial content helps founders, architects, partners, and enterprise stakeholders see the bridge between fast product creation and production-grade architecture. It also gives Axis-managed publication a meaningful business object to govern.",
        },
        {
          title: "Governed delivery",
          body: "The content is still delivered through CMS and Editorial records rather than hardcoded React pages. That preserves the production direction: future Axis-managed authoring and publication can replace seed-data maintenance without changing the reusable Nexus renderer. The release data, route data, localization projection, and media references remain part of one inspectable publication path.",
        },
      ],
      takeaways: [
        "News and Blogs now explain real Nodics framework themes.",
        "Editorial source, CMS routes, and Online projections remain aligned.",
        "Nexus continues to render governed content instead of owning article truth.",
      ],
      href: "/news",
      linkLabel: "Back to News",
    },
  },
  record74: {
    code: "nexusBlogListingHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics Blog",
      heading: "Architecture thinking for AI-era enterprise delivery.",
      breadcrumbLabel: "Blogs",
      body: "Read practical thinking on AI-assisted delivery, scalability beyond infrastructure, architecture ownership, and the Nodics path from prototype to enterprise scale.",
      referenceImageCode: "nexusBlogEditorialPublication",
      imageAlt: "Enterprise architects preparing governed Nodics blog insights",
    },
  },
  record75: {
    code: "nexusBlogListing",
    typeCode: "nexusEditorialListingType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Blog index",
      heading: "Searchable Nodics framework insights.",
      body: "Use grid view for scanning or list view for deeper review. Blog content explains the architecture ideas behind AI-assisted delivery, scalability, governance, and enterprise-ready foundations.",
      contentTypeCode: "BLOG",
      defaultView: "grid",
      searchPlaceholder: "Search blogs by title, summary, tag, or capability",
      emptyMessage: "No blog posts matched the selected filters.",
      articles: [
        {
          code: "nexus-blog-engagement-framework",
          contentTypeCode: "BLOG",
          category: "AI Foundation",
          date: "2026-08-18",
          special: false,
          title: "Vibe coding on top of enterprise engineering.",
          summary:
            "AI-assisted development is making application creation faster, but successful software still needs security, tenancy, auditability, resilience, and integration foundations.",
          href: "/blog/vibe-coding-on-top-of-enterprise-engineering",
          referenceImageCode: "nexusBlogCustomerEngagement",
          imageAlt:
            "Customer engagement capability connected to governed Nexus public journeys",
          tags: ["AI", "Enterprise", "Foundation"],
        },
        {
          code: "nexus-blog-editorial-publication",
          contentTypeCode: "BLOG",
          category: "Scalability",
          date: "2026-08-22",
          special: true,
          specialLabel: "Featured insight",
          specialRank: 10,
          specialFrom: "2026-08-11T00:00:00.000Z",
          specialUntil: null,
          specialVariant: "gold",
          title: "Scalability is not only about servers.",
          summary:
            "Infrastructure is only one dimension of scale; enterprise applications also need to scale across people, domains, integrations, governance, and change.",
          href: "/blog/scalability-is-not-only-about-servers",
          referenceImageCode: "nexusBlogEditorialPublication",
          imageAlt:
            "Governed editorial publication delivered through Nodics CMS",
          tags: ["Scalability", "Architecture", "Domains"],
        },
        {
          code: "nexus-blog-runtime-discovery",
          contentTypeCode: "BLOG",
          category: "Architecture",
          date: "2026-08-26",
          special: false,
          title: "Who builds the architecture after AI builds the application?",
          summary:
            "AI can accelerate implementation, but architecture decides whether a growing product can stay available, governable, observable, and changeable.",
          href: "/blog/who-builds-architecture-after-ai-builds-application",
          referenceImageCode: "nexusBlogRuntimeDiscovery",
          imageAlt:
            "Runtime service discovery for portable Nodics frontend applications",
          tags: ["AI", "Architecture", "Resilience"],
        },
        {
          code: "nexus-blog-axis-business-operations",
          contentTypeCode: "BLOG",
          category: "Governance",
          date: "2026-08-29",
          special: false,
          title: "From prototype speed to governed scale in Nodics.",
          summary:
            "Nodics connects fast application delivery with reusable module boundaries, publication control, runtime evidence, and operational governance.",
          href: "/blog/prototype-speed-to-governed-scale-in-nodics",
          referenceImageCode: "nexusBlogAxisOperations",
          imageAlt:
            "Axis business operations composed through clean framework capability",
          tags: ["Nodics", "Governance", "Scale"],
        },
      ],
    },
  },
  record76: {
    code: "nexusBlogEngagementFrameworkHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics Blog",
      heading: "Vibe coding on enterprise foundations.",
      breadcrumbLabel: "Blog",
      body: "AI-assisted development can move from idea to application quickly; Nodics asks how that speed survives real enterprise complexity.",
      referenceImageCode: "nexusBlogCustomerEngagement",
      imageAlt:
        "Customer engagement capability connected to governed Nexus public journeys",
    },
  },
  record77: {
    code: "nexusBlogEngagementFrameworkDetail",
    typeCode: "nexusEditorialDetailType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      contentTypeCode: "BLOG",
      category: "AI Foundation",
      date: "2026-08-18",
      author: "Himkar Dwivedi",
      title: "Vibe coding on top of enterprise engineering.",
      summary:
        "AI-assisted development is making application creation faster, but successful software still needs security, tenancy, auditability, resilience, and integration foundations.",
      referenceImageCode: "nexusBlogCustomerEngagement",
      imageAlt:
        "Customer engagement capability connected to governed Nexus public journeys",
      bodyText:
        "AI-assisted coding has changed the economics of software experimentation. A founder can describe an idea in natural language and receive a working interface, connected data, authentication, a dashboard, and deployable behavior much faster than traditional delivery allowed. That is a remarkable change, and Nodics should embrace it rather than resist it.\n\nThe deeper question is what happens after the demo becomes a business. Twenty test users do not create the same pressure as ten thousand customers. A prototype can tolerate loose assumptions that an enterprise product cannot: unclear ownership, weak tenant isolation, missing audit trails, fragile integration, no retry model, unmanaged configuration, and hidden operational risk.\n\nThis is where Nodics positions itself. The goal is not to replace AI builders or slow down vibe coding. The goal is to let generated applications graduate. AI can continue helping teams create the business experience, while the framework provides reusable foundations for security, tenancy, events, APIs, auditability, integration, resilience, data governance, and deployment control.\n\nThe reason this matters now is that AI changes the shape of the first stage. More people can build. More ideas can reach users. More prototypes can become businesses before their architecture has been deliberately shaped. That is healthy for innovation, but it also means architecture debt can arrive earlier and with more public consequences.\n\nA generated feature can look complete while the business rules around it remain unresolved. A promotion screen can be produced quickly, but promotion versioning, contract pricing, inventory changes, payment retries, tenant-specific policies, audit history, and downstream notifications are architecture concerns. They decide whether the feature is merely present or truly dependable.\n\nNodics should give AI-era builders a foundation that keeps the exciting part fast. Instead of asking every project to rediscover authentication, module boundaries, configuration, events, publication, auditability, observability, and integration from first principles, the framework should let each project concentrate on its unique business capability and still have somewhere serious to grow.",
      sections: [
        {
          title: "Speed changed the first stage",
          body: "AI can compress the journey from idea to prototype and give teams a working application before traditional delivery models would finish planning. That changes the first stage of product creation: teams can validate more ideas, gather feedback earlier, and focus human effort on the uniqueness of the business. Nodics should preserve that acceleration while making sure the application does not become harder to govern with every successful iteration.",
        },
        {
          title: "Complexity did not disappear",
          body: "Complexity rarely disappears; it moves. AI can hide much of the coding, cloud can hide some infrastructure, and frameworks can hide repeated plumbing. But when software touches real customers, money, history, contracts, countries, and regulations, responsibilities such as data integrity, security, auditability, resilience, and domain correctness become unavoidable. The architecture has to give those responsibilities a clear owner.",
        },
        {
          title: "The Nodics path",
          body: "Nodics is designed to preserve experimentation speed while giving applications governed module contracts, runtime visibility, and enterprise-grade foundations. A team should be able to start quickly, then move toward stronger architecture without treating success as the beginning of a rewrite. That is the difference between building everything for future scale and building with a path to future scale.",
        },
      ],
      takeaways: [
        "AI-assisted delivery accelerates the first working application.",
        "Enterprise foundations prevent speed from turning into fragility.",
        "Nodics connects fast generation with durable application engineering.",
      ],
      href: "/blogs",
      linkLabel: "Back to Blogs",
    },
  },
  record78: {
    code: "nexusBlogEditorialPublicationHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics Blog",
      heading: "Scalability beyond servers.",
      breadcrumbLabel: "Blog",
      body: "A scalable application must grow across people, data, domains, integrations, teams, security, and time.",
      referenceImageCode: "nexusBlogEditorialPublication",
      imageAlt: "Governed editorial publication delivered through Nodics CMS",
    },
  },
  record79: {
    code: "nexusBlogEditorialPublicationDetail",
    typeCode: "nexusEditorialDetailType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      contentTypeCode: "BLOG",
      category: "Scalability",
      date: "2026-08-22",
      author: "Himkar Dwivedi",
      title: "Scalability is not only about servers.",
      summary:
        "Infrastructure is only one dimension of scale; enterprise applications also need to scale across people, domains, integrations, governance, and change.",
      referenceImageCode: "nexusBlogEditorialPublication",
      imageAlt: "Governed editorial publication delivered through Nodics CMS",
      bodyText:
        "When people hear the word scalability, they often think about servers, databases, cloud capacity, and traffic. Those concerns are real, but they are only one part of what makes enterprise software scalable.\n\nA product can survive a traffic spike and still fail to scale as a business. It may not support richer roles. It may not isolate tenant data. Its order model may not handle returns or refunds. Its promotions may not be versioned. Its integrations may fail without idempotency. Its teams may be forced to coordinate every change because no module boundary is trusted.\n\nNodics treats scalability as a multi-dimensional architecture problem. Traffic, data, users, teams, domains, integrations, security, operations, and time all need a place in the design. Infrastructure helps with part of that. Architecture, ownership, governance, and runtime evidence help with the rest.\n\nThe server-focused definition of scalability is attractive because it is measurable. Requests per second, CPU, latency, cache hit rate, and database throughput are all important signals. But they do not tell the full business story. The system may be technically fast and still unable to support a new tenant model, a regional compliance rule, a supplier workflow, a partner integration, or a second engineering team.\n\nAs the business grows, a simple user model becomes a permission model. A simple catalog becomes variants, localization, pricing, taxes, and fulfillment. A simple order becomes payment state, cancellation, return, refund, audit, notification, and operational recovery. Each stage requires decisions about ownership, contracts, events, and data history.\n\nThat is why Nodics treats scalability as a framework concern. The platform should help projects scale their runtime, but also their operating model. Clear module boundaries, published data flows, API contracts, workflow approvals, runtime discovery, and evidence-driven releases are what keep change possible after the first success.",
      sections: [
        {
          title: "Users and permissions scale too",
          body: "More users means more roles, more approval paths, more visibility rules, and stronger tenant and data boundaries. A model that begins with admin and customer eventually needs employees, managers, suppliers, support agents, auditors, partners, and tenant administrators. At that point, scalability is about authority and isolation as much as traffic.",
        },
        {
          title: "Business domains keep expanding",
          body: "A simple product, cart, or order model eventually meets variants, bundles, categories, localization, contract prices, promotions, taxes, currencies, payments, fulfillment, cancellations, returns, and refunds. The application is not just receiving more requests; the business meaning of its data has become richer. Architecture has to separate those meanings so each capability can evolve with less shared risk.",
        },
        {
          title: "Time and change are part of scale",
          body: "Scalable architecture lets teams version behavior, evolve modules, operate integrations, and recover from failures without freezing the business. The real test is whether the application can still be safely changed years later, after hundreds of features and several teams have shaped it. A system that cannot change safely has not really scaled, even if the servers are healthy.",
        },
      ],
      takeaways: [
        "Server capacity is only one part of scalability.",
        "Business growth increases roles, domains, integrations, and governance needs.",
        "Architecture keeps the system changeable as scale arrives.",
      ],
      href: "/blogs",
      linkLabel: "Back to Blogs",
    },
  },
  record80: {
    code: "nexusBlogRuntimeDiscoveryHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics Blog",
      heading: "Who builds the architecture?",
      breadcrumbLabel: "Blog",
      body: "AI can build the application, but architecture decides whether success becomes durable or painful.",
      referenceImageCode: "nexusBlogRuntimeDiscovery",
      imageAlt:
        "Runtime service discovery for portable Nodics frontend applications",
    },
  },
  record81: {
    code: "nexusBlogRuntimeDiscoveryDetail",
    typeCode: "nexusEditorialDetailType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      contentTypeCode: "BLOG",
      category: "Architecture",
      date: "2026-08-26",
      author: "Himkar Dwivedi",
      title: "Who builds the architecture after AI builds the application?",
      summary:
        "AI can accelerate implementation, but architecture decides whether a growing product can stay available, governable, observable, and changeable.",
      referenceImageCode: "nexusBlogRuntimeDiscovery",
      imageAlt:
        "Runtime service discovery for portable Nodics frontend applications",
      bodyText:
        "AI can help build the first working application. Architecture decides whether the application can survive its own success.\n\nThat distinction becomes visible when demand arrives faster than the system is ready. Customers join, usage increases, transactions climb, investors notice, and the product suddenly has to behave like a dependable business system. The first version may have proved that people want the product, but it may not yet prove that the product can be operated, secured, audited, integrated, and evolved.\n\nNodics treats that moment as the central architecture problem of AI-era software. The framework should allow teams to begin simply while already having a path toward domain boundaries, service ownership, API contracts, configuration, events, auditability, publication control, observability, integration, resilience, and recovery.\n\nThe article points at a pattern many successful products eventually face. Demand can arrive before the platform is ready. A startup may have customers, investors, transactions, and usage, while the internals still carry assumptions from the discovery phase. At that point, technical weaknesses stop being invisible engineering details and become customer-experience, revenue, reputation, compliance, and operational problems.\n\nAI makes this transition faster. The first version can be assembled with remarkable speed, which means product-market fit may arrive before ownership boundaries, failure recovery, tenant isolation, API discipline, and observability have matured. That does not make AI the problem. It makes preparation more important.\n\nThe Nodics answer is to separate fast creation from uncontrolled growth. The business experience can move quickly, but the platform should keep contracts, capabilities, routes, publication state, integration boundaries, and runtime evidence understandable. That is how an AI-built application can become a governed system rather than a successful prototype under stress.",
      sections: [
        {
          title: "Product-market fit changes the load",
          body: "Once an AI-built product succeeds, the pressure shifts from building screens to protecting data, scaling teams, and keeping integrations reliable. Product-market fit changes the questions from can we build it to can we operate it, recover it, explain it, and change it safely. Those questions need architectural answers before they become emergency rewrites.",
        },
        {
          title: "Ownership has to be visible",
          body: "Architecture clarifies which module owns a capability, which data is public, which records are publishable, which actions need approval, which events cross boundaries, and which evidence proves readiness. Without that visibility, success can turn every change into discovery work. Nodics uses module ownership, publication contracts, and runtime evidence to keep that responsibility visible.",
        },
        {
          title: "Prepare for success earlier",
          body: "The goal is not heavy overengineering or beginning every MVP with a large distributed platform. The more useful idea is a path to future scale: simple enough for today, structured enough that tomorrow's growth does not require rediscovering the basics of security, integration, events, auditability, and governance. That path is where Nodics can make AI-assisted delivery practical for serious businesses.",
        },
      ],
      takeaways: [
        "AI-generated applications may reach complexity faster than before.",
        "Architecture turns product success into durable system behavior.",
        "Nodics provides a path from fast MVP to governed scale.",
      ],
      href: "/blogs",
      linkLabel: "Back to Blogs",
    },
  },
  record82: {
    code: "nexusBlogAxisBusinessOperationsHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics Blog",
      heading: "From prototype speed to governed scale.",
      breadcrumbLabel: "Blog",
      body: "Nodics connects fast application delivery with module boundaries, publication control, runtime evidence, and governance.",
      referenceImageCode: "nexusBlogAxisOperations",
      imageAlt:
        "Axis business operations composed through clean framework capability",
    },
  },
  record83: {
    code: "nexusBlogAxisBusinessOperationsDetail",
    typeCode: "nexusEditorialDetailType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      contentTypeCode: "BLOG",
      category: "Governance",
      date: "2026-08-29",
      author: "Nodics Architecture Team",
      title: "From prototype speed to governed scale in Nodics.",
      summary:
        "Nodics connects fast application delivery with reusable module boundaries, publication control, runtime evidence, and operational governance.",
      referenceImageCode: "nexusBlogAxisOperations",
      imageAlt:
        "Axis business operations composed through clean framework capability",
      bodyText:
        "The three public articles describe one common tension: AI can make software creation faster, but successful software still needs architecture that can scale across business, people, systems, and time.\n\nThat tension is exactly where Nodics is being shaped. Nexus explains the ideas publicly. Axis should make operations understandable and governed. Kickoff proves customer-project composition through real data packs and runtime topology. The framework keeps reusable module contracts, APIs, publication rules, runtime evidence, and extension boundaries visible under the surface.\n\nThe goal is a practical graduation path. A team should be able to move from idea to MVP quickly, then from MVP to customers, and then from customers to serious business software without architecture becoming the penalty for success.\n\nNodics is not trying to make every early product heavy. The point is to avoid the false choice between fast experimentation and serious engineering. A project can begin with a focused business experience while the framework supplies repeatable foundations for identity, authorization, module ownership, configuration, events, import, publication, observability, and operational recovery.\n\nNexus, Axis, and Kickoff each express part of that model. Nexus is the public delivery surface. Axis is the operational and authoring control plane. Kickoff is the reference customer project proving that framework capabilities can be composed through real data, manifests, runtime topology, and acceptance checks. The framework underneath should keep ownership clear enough that these surfaces do not duplicate authority.\n\nThat is the production story the Blogs and News sections should tell. A visitor should leave with a practical understanding: Nodics helps teams start quickly, keep business-specific work close to the customer project, and still publish, operate, and evolve applications through governed enterprise foundations.",
      sections: [
        {
          title: "Start fast, keep structure",
          body: "Teams should be able to experiment quickly without losing the module boundaries and contracts needed for serious operation. Speed is most valuable when it does not create a hidden debt wall immediately after validation. Nodics should make the early path feel light while still preserving the contracts a future team will need.",
        },
        {
          title: "Use governed modules",
          body: "Reusable framework capabilities, project-owned data packs, and public delivery projections keep responsibility visible as the experience grows. Nodics separates what belongs to the framework, what belongs to the customer project, what is published online, and what remains operationally controlled. That separation is what allows Nexus content, Axis operations, and backend modules to evolve without becoming one confused authority.",
        },
        {
          title: "Make readiness visible",
          body: "Publication state, manifest hashes, route records, tests, and runtime evidence help turn a public site update into an inspectable release. The same discipline that makes content safe to publish also supports the broader Nodics goal: fast delivery with visible governance. When the content, route, media, and Online projection can be traced, the public website becomes evidence of the architecture instead of a separate handcrafted layer.",
        },
      ],
      takeaways: [
        "Nodics connects AI-era speed with enterprise delivery discipline.",
        "Module ownership keeps the framework and project layers understandable.",
        "Governed publication and validation turn public content into release evidence.",
      ],
      href: "/blogs",
      linkLabel: "Back to Blogs",
    },
  },
  record84: {
    code: "nexusDevelopersLocalJourney",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "developer-local-journey",
      kicker: "Local journey",
      heading: "Run the complete reference experience before you customize.",
      body: "A new developer should first see Nodics working end to end. The local journey keeps each repository understandable while proving that the framework, runtime, BackOffice, and public site compose into one solution.",
      items: [
        {
          symbol: "CORE",
          title: "nodics.ai",
          text: "Framework capabilities, contracts, schemas, services, import rules, documentation, and reusable module ownership.",
        },
        {
          symbol: "RUN",
          title: "nodics.kickoff",
          text: "Reference runtime and project data that demonstrates how a customer application composes framework modules locally.",
        },
        {
          symbol: "OPS",
          title: "nodics.axis",
          text: "BackOffice control plane for runtime visibility, schema workbench, CMS, API reference, documentation, and operations.",
        },
        {
          symbol: "WEB",
          title: "nodics.nexus",
          text: "Public Nexus frontend that renders CMS-managed corporate, documentation, news, blog, and engagement experiences.",
        },
      ],
      href: "/docs",
      linkLabel: "Open local setup guide",
    },
  },
  record85: {
    code: "nexusDevelopersAiAssisted",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "developer-ai-assisted",
      kicker: "AI-assisted delivery",
      heading: "Know what to write, where it belongs and how it works.",
      body: "Your experience with services, validation, deployment and support remains valuable when you adopt AI. Human developers and AI tools follow the same Nodics contracts, so a team can inspect, extend and maintain the application through its source and documentation, without depending on the original coding conversation.",
      items: [
        {
          symbol: "ASK",
          title: "Define what should change",
          text: "Clarify the business outcome, inspect current contracts and reuse the capability that already owns the behavior.",
        },
        {
          symbol: "READ",
          title: "Find where it belongs",
          text: "Identify the owning repository, module, layer and source definition before writing code. Keep customer-specific changes in the supported project boundary.",
        },
        {
          symbol: "BUILD",
          title: "Use the supported extension",
          text: "Apply intentional configuration differences or a documented extension point. Keep generated artifacts tied to their source definitions and preserve security and domain validation.",
        },
        {
          symbol: "PROVE",
          title: "Prove another engineer can maintain it",
          text: "Review the change, test default and customized behavior, and document diagnostics and recovery. Manual development uses the same source files and contracts as AI-assisted work.",
        },
      ],
      href: "/docs/framework",
      linkLabel: "Read what Nodics stands for",
    },
  },
  record87: {
    code: "nexusCorporateSiteHeader",
    typeCode: "nexusCorporateSiteHeaderType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      brandLabel: "NODICS",
      brandSubtitle: "NEXUS",
      navigation: [
        {
          label: "Home",
          href: "/",
          id: "home",
        },
        {
          label: "About",
          href: "/#aboutus",
          id: "about",
        },
        {
          label: "Products",
          href: "/#products",
          id: "products",
        },
        {
          label: "Solutions",
          href: "/#solutions",
          id: "solutions",
        },
        {
          label: "Support",
          href: "/#support",
          id: "support",
        },
        {
          label: "Blogs",
          href: "/#blogs",
          id: "blogs",
        },
        {
          label: "Docs",
          href: "/docs",
          id: "wiki",
        },
        {
          label: "Axis",
          href: "{axisBaseUrl}",
          id: "axis",
        },
      ],
    },
  },
  record88: {
    code: "nexusCorporateSiteFooter",
    typeCode: "nexusCorporateSiteFooterType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      brandSummary:
        "Where enterprise capabilities, technology, and knowledge connect.",
      contactHeading: "Connect",
      contactEmail: "nodics.framework@gmail.com",
      socialLinks: [
        {
          name: "GitHub",
          href: "https://github.com/Nodics",
        },
        {
          name: "LinkedIn",
          href: "https://www.linkedin.com/company/nodics",
        },
      ],
      groups: [
        {
          title: "Platform",
          links: [
            {
              label: "Features",
              href: "/#features",
            },
            {
              label: "Products",
              href: "/#products",
            },
            {
              label: "Solutions",
              href: "/#solutions",
            },
            {
              label: "Technology Stack",
              href: "/#technology",
            },
            {
              label: "Support",
              href: "/#support",
            },
          ],
        },
        {
          title: "Developers",
          links: [
            {
              label: "Docs",
              href: "/docs",
            },
            {
              label: "API Reference",
              href: "/docs?tab=api",
            },
            {
              label: "GitHub",
              href: "https://github.com/Nodics",
            },
            {
              label: "Axis",
              href: "{axisBaseUrl}",
            },
          ],
        },
        {
          title: "Company",
          links: [
            {
              label: "About",
              href: "/#aboutus",
            },
            {
              label: "Ecosystem",
              href: "/#ecosystem",
            },
            {
              label: "Contact",
              href: "/#contact",
            },
            {
              label: "Testimonials",
              href: "/#testimonials",
            },
          ],
        },
        {
          title: "Resources",
          links: [
            {
              label: "Blogs",
              href: "/#blogs",
            },
            {
              label: "News",
              href: "/news",
            },
            {
              label: "Documentation Gateway",
              href: "/docs",
            },
          ],
        },
      ],
      legalText: "© 2026 Nodics. All rights reserved.",
      legalLinks: [
        {
          label: "Privacy",
          href: "/privacy",
        },
        {
          label: "Terms",
          href: "/terms",
        },
        {
          label: "Cookies",
          href: "/cookies",
        },
      ],
    },
  },
  record86: {
    code: "nexusDevelopersOwnership",
    typeCode: "nexusCardGridType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "developer-ownership",
      kicker: "Ownership model",
      heading: "Know what to reuse, what to extend, and what to prove.",
      body: "The fastest Nodics implementation is not the one that changes everything. It is the one that reuses framework capability, keeps customer-specific behavior in the project, and proves each customization through visible contracts.",
      items: [
        {
          symbol: "REUSE",
          title: "Reuse framework capability",
          text: "Identity, CMS, media, process, commerce, communication, engagement, import, schema, and documentation contracts remain framework-owned.",
        },
        {
          symbol: "OWN",
          title: "Own customer context",
          text: "Customer journeys, data, branding, integrations, provider configuration, and environment policy belong to the implementation project.",
        },
        {
          symbol: "SHIP",
          title: "Ship with evidence",
          text: "Promotion should include tests, generated contracts, release versions, content-pack checksums, operational notes, and rollback understanding.",
        },
      ],
      href: "https://github.com/Nodics",
      linkLabel: "View repositories",
    },
  },
  record92: {
    code: "nexusProductsDashboard",
    typeCode: "nexusProductPortfolioType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "product-overview",
      mode: "dashboard",
      kicker: "The product portfolio",
      heading: "Explore the experience. Find your fit.",
      body: "Each product brings a distinct business journey to life on the Nodics foundation. Start with the industry you serve, then explore the screens, capabilities and adoption path.",
      products: [
        {
          title: "Waste Management",
          edition: "Showcased through Circa",
          category: "Waste & circularity",
          summary:
            "Designed for Telegram and WhatsApp, with no new mobile app to download. Connect customer conversations with guided submissions, operator review and circular rewards.",
          audience:
            "Collection operators, circular programmes and community partners.",
          highlights: [
            "Telegram & WhatsApp journeys",
            "No new mobile app",
            "Evidence, review & rewards",
          ],
          adoption: "Channel activation, collection rules and reward partners.",
          href: "/products/waste-management",
          referenceImageCode: "nexusProduct-waste-home",
          imageAlt: "Waste Management reference storefront on desktop",
          mobileScreen: {
            referenceImageCode: "nexusProduct-waste-mobile",
            imageAlt: "Waste Management reference storefront on mobile",
          },
        },
        {
          title: "Agora Apparel",
          edition: "Fashion commerce",
          category: "Commerce",
          summary:
            "Turn collections and campaigns into a connected fashion shopping experience, from discovery to order history.",
          audience:
            "Fashion brands, apparel retailers and curated marketplaces.",
          highlights: [
            "Collections & campaigns",
            "Product variants",
            "Cart & checkout",
          ],
          adoption:
            "Brand storytelling, product variants and fulfilment partners.",
          href: "/products/agora-apparel",
          referenceImageCode: "nexusProduct-apparel-home-v2",
          imageAlt: "Agora Apparel reference storefront on desktop",
          mobileScreen: {
            referenceImageCode: "nexusProduct-apparel-mobile-v2",
            imageAlt: "Agora Apparel reference storefront on mobile",
          },
        },
        {
          title: "Agora Electronics",
          edition: "Device commerce",
          category: "Commerce",
          summary:
            "Make devices easier to discover and buy with a focused catalogue, product details and a connected checkout.",
          audience:
            "Device retailers, electronics brands and specialist resellers.",
          highlights: [
            "Device catalogue",
            "Product details",
            "Customer orders",
          ],
          adoption: "Product specifications, stock, warranty and delivery.",
          href: "/products/agora-electronics",
          referenceImageCode: "nexusProduct-electronics-home",
          imageAlt: "Agora Electronics reference storefront on desktop",
          mobileScreen: {
            referenceImageCode: "nexusProduct-electronics-mobile",
            imageAlt: "Agora Electronics reference storefront on mobile",
          },
        },
        {
          title: "Agora Telco",
          edition: "Plan & device commerce",
          category: "Commerce",
          summary:
            "Present prepaid and postpaid offers through a branded storefront with a familiar commerce journey.",
          audience:
            "Telecom brands, service resellers and digital sales teams.",
          highlights: [
            "Prepaid & postpaid",
            "Offer discovery",
            "Commerce journey",
          ],
          adoption: "Offer rules, eligibility and carrier-system integration.",
          href: "/products/agora-telco",
          referenceImageCode: "nexusProduct-telco-home",
          imageAlt: "Agora Telco reference storefront on desktop",
          mobileScreen: {
            referenceImageCode: "nexusProduct-telco-mobile",
            imageAlt: "Agora Telco reference storefront on mobile",
          },
        },
      ],
      comparisonKicker: "Choose your starting point",
      comparisonHeading: "Four products. Different business journeys.",
      adoptionKicker: "From product to your business",
      adoptionHeading: "Keep the foundation. Make the experience yours.",
      adoptionBody:
        "Start with a working reference experience, shape the brand and business rules, connect your operational partners, and validate the complete journey before launch.",
      readinessNote:
        "Screens show running reference applications with sample content. Production payments, fulfilment, partner services and industry integrations are agreed and validated during adoption.",
    },
  },
  record93: {
    code: "nexusProductWasteHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Showcased through Circa",
      heading: "Waste Management",
      breadcrumbLabel: "Waste Management",
      body: "Designed for Telegram and WhatsApp, with no new mobile app to download. Connect customer conversations with guided submissions, operator review and circular rewards.",
      referenceImageCode: "nexusProduct-waste-home",
      imageAlt: "Waste Management reference storefront",
      imageTreatment: "soft-focus",
      breadcrumbParentHref: "/products",
      breadcrumbParentLabel: "Products",
    },
  },
  record94: {
    code: "nexusProductWasteStory",
    typeCode: "nexusProductStoryType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "waste-management",
      kicker: "Familiar channels. Easier participation.",
      heading: "Turn everyday conversations into circular action.",
      body: "Meet customers in Telegram or WhatsApp and remove the need to download another app. The conversational journey is designed to guide people from intent and location through arrival checks, photo evidence and operator review, connecting the conversation with the wider Circa experience.",
      audience:
        "Collection operators, circular programmes and community partners.",
      outcomes: [
        {
          title: "Start where your customers already are",
          body: "Lower the barrier to participation by bringing the journey into familiar messaging channels. No new app to discover, download or learn.",
        },
        {
          title: "Make the next step clear",
          body: "Guide customers through one conversation, from what they want to submit to where they should go and what evidence they need to provide.",
        },
        {
          title: "Connect participation with operations",
          body: "Bring the customer conversation into a structured submission that your team can review, with eligible rewards and reuse opportunities completing the wider journey.",
        },
      ],
      tourKicker: "A closer look",
      tourHeading: "Explore the wider Circa experience.",
      tourBody:
        "See how collection, rewards and reuse come together in the supporting web experience. Conversational participation is designed to start in Telegram or WhatsApp.",
      gallery: [
        {
          label: "Desktop storefront",
          referenceImageCode: "nexusProduct-waste-home",
          imageAlt: "Waste Management desktop home screen",
          caption:
            "A captured screen of the running Waste Management reference experience. Sample content is shown.",
          format: "desktop",
        },
        {
          label: "Circular marketplace",
          referenceImageCode: "nexusProduct-waste-shop",
          imageAlt: "Waste Management circular marketplace",
          caption:
            "The Circa marketplace presents verified assets and the points needed for the sample offers.",
          format: "desktop",
        },
        {
          label: "Mobile experience",
          referenceImageCode: "nexusProduct-waste-mobile",
          imageAlt: "Waste Management mobile storefront",
          caption:
            "The reference storefront at a mobile viewport. Branding and content can be adapted during adoption.",
          format: "mobile",
        },
      ],
      capabilitiesKicker: "What the product brings",
      capabilitiesHeading: "A connected set of capabilities.",
      capabilities: [
        {
          title: "Collection discovery",
          body: "Find collection centres and use location to guide the arrival and submission journey.",
        },
        {
          title: "Conversational submissions",
          body: "Designed for Telegram and WhatsApp, connecting customer intent, location and photo evidence to the Waste submission process without a separate mobile app.",
        },
        {
          title: "Review and approval",
          body: "Give operators a structured submission to verify and approve before the customer journey advances.",
        },
        {
          title: "Customer account",
          body: "Bring submission history, wallet activity and participation status together in one account.",
        },
        {
          title: "Points and coupons",
          body: "Connect eligible activity with a points wallet and a configurable coupon experience.",
        },
        {
          title: "Circular marketplace",
          body: "Discover verified assets, fixed-price purchases and gifting journeys that support reuse.",
        },
      ],
      workflowKicker: "The intended channel journey",
      workflowHeading: "From a familiar conversation to a connected journey.",
      workflow: [
        {
          title: "Start a conversation",
          body: "Enter through the programme’s Telegram or WhatsApp channel and share what you want to submit.",
        },
        {
          title: "Find the right collection point",
          body: "Use location and programme rules to identify the next appropriate step.",
        },
        {
          title: "Share evidence on arrival",
          body: "Confirm arrival and provide the item details and photographs needed for review.",
        },
        {
          title: "Follow the outcome",
          body: "Track the submission decision and continue into eligible rewards and reuse opportunities.",
        },
      ],
      adoptionKicker: "Make it yours",
      adoptionHeading: "A clear path from reference to launch.",
      adoptionBody:
        "Review the experience with your team, agree the operational scope and tailor the product to the people you serve.",
      adoption: [
        {
          title: "Current reference experience",
          body: "The Circa web experience demonstrates collection discovery, evidence capture, review, customer accounts, wallet, coupons and the asset marketplace.",
        },
        {
          title: "Configured for your programme",
          body: "Choose your customer channels, collection locations, material eligibility, review rules, reward policies, brand and partner offers.",
        },
        {
          title: "Connected before launch",
          body: "Activate and qualify Telegram or WhatsApp delivery and customer identity linking for your programme. Agree physical receipt, custody and partner redemption operations, with transport integration where required.",
        },
      ],
      faqKicker: "Before you begin",
      faqHeading: "Questions worth answering.",
      faq: [
        {
          question: "Do customers need to install a new mobile app?",
          answer:
            "The conversational journey is designed to run through Telegram or WhatsApp, using an app the customer already has. Each programme chooses and activates the channels it supports. The Circa web experience remains available for broader account and marketplace needs.",
        },
        {
          question: "Does approval mean an item has been physically received?",
          answer:
            "No. Approval records a review decision. Physical receipt and custody need their own receiver, location, time and evidence. Transport orchestration is an optional integration.",
        },
        {
          question:
            "Are carbon figures certified or rewards universally redeemable?",
          answer:
            "Impact figures are estimates unless a separately validated methodology is agreed. Reward value, eligibility and redemption depend on the programme and connected partners.",
        },
      ],
    },
  },
  record95: {
    code: "nexusProductApparelHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Fashion commerce",
      heading: "Agora Apparel",
      breadcrumbLabel: "Agora Apparel",
      body: "Turn collections and campaigns into a connected fashion shopping experience, from discovery to order history.",
      referenceImageCode: "nexusProduct-apparel-home-v2",
      imageAlt: "Agora Apparel reference storefront",
      imageTreatment: "soft-focus",
      breadcrumbParentHref: "/products",
      breadcrumbParentLabel: "Products",
    },
  },
  record96: {
    code: "nexusProductApparelStory",
    typeCode: "nexusProductStoryType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "agora-apparel",
      kicker: "Fashion commerce",
      heading:
        "Let your collections lead. Keep the shopping journey connected.",
      body: "Bring your brand story, seasonal edits and product range into the same storefront. Agora Apparel gives customers a familiar path to discover a collection, choose a variant and complete a sample order, with room to shape the experience around your business.",
      audience: "Fashion brands, apparel retailers and curated marketplaces.",
      outcomes: [
        {
          title: "Merchandise with a point of view",
          body: "Give campaigns and curated collections a place alongside searchable product discovery.",
        },
        {
          title: "Help shoppers choose",
          body: "Present product images, variants and availability in a consistent browsing and detail experience.",
        },
        {
          title: "Carry intent through to order",
          body: "Connect product discovery with saved choices, the cart, checkout and customer order history.",
        },
      ],
      tourKicker: "A closer look",
      tourHeading: "See the experience.",
      tourBody:
        "See the running Agora Apparel storefront, a curated shop view and its mobile presentation. Screens use sample catalogue and campaign content.",
      gallery: [
        {
          label: "Desktop storefront",
          referenceImageCode: "nexusProduct-apparel-home-v2",
          imageAlt: "Agora Apparel desktop home screen",
          caption:
            "A captured screen of the running Agora Apparel reference experience. Sample content is shown.",
          format: "desktop",
        },
        {
          label: "Shop & collections",
          referenceImageCode: "nexusProduct-apparel-shop-v2",
          imageAlt: "Agora Apparel shop & collections",
          caption:
            "A curated shop page brings editorial merchandising and product discovery into one experience.",
          format: "desktop",
        },
        {
          label: "Shop mega menu",
          referenceImageCode: "nexusProduct-apparel-menu",
          imageAlt:
            "Agora Apparel Shop mega menu with clothing, bags and accessories beneath a five-link header",
          caption:
            "Five clear navigation paths keep the header compact, while grouped mega menus make clothing, accessories, brands and digital coupons easy to discover.",
          format: "desktop",
        },
        {
          label: "Mobile experience",
          referenceImageCode: "nexusProduct-apparel-mobile-v2",
          imageAlt: "Agora Apparel mobile storefront",
          caption:
            "The reference storefront at a mobile viewport. Branding and content can be adapted during adoption.",
          format: "mobile",
        },
      ],
      capabilitiesKicker: "What the product brings",
      capabilitiesHeading: "A connected set of capabilities.",
      capabilities: [
        {
          title: "Campaign-led storefront",
          body: "Present seasonal stories, featured products and curated edits through managed storefront content.",
        },
        {
          title: "Product discovery",
          body: "Browse collections, search products and refine the range with filters and sorting.",
        },
        {
          title: "Variant selection",
          body: "Carry apparel choices such as size and colour through product details and the shopping journey.",
        },
        {
          title: "Quick view and product details",
          body: "Give shoppers a closer look without losing the context of the collection they are browsing.",
        },
        {
          title: "Cart and checkout",
          body: "Move selected products through a connected cart and sample checkout with order confirmation.",
        },
        {
          title: "Customer continuity",
          body: "Support account, wishlist and order-history experiences across repeat visits.",
        },
      ],
      workflowKicker: "The business journey",
      workflowHeading: "How the experience comes together.",
      workflow: [
        {
          title: "Discover a collection",
          body: "Enter through a campaign, collection or product search.",
        },
        {
          title: "Choose your piece",
          body: "Review the product and select the appropriate variant.",
        },
        {
          title: "Build the order",
          body: "Check the cart and complete the configured checkout journey.",
        },
        {
          title: "Return with context",
          body: "Use the customer account to revisit saved products and order history.",
        },
      ],
      adoptionKicker: "Make it yours",
      adoptionHeading: "A clear path from reference to launch.",
      adoptionBody:
        "Review the experience with your team, agree the operational scope and tailor the product to the people you serve.",
      adoption: [
        {
          title: "Available in the reference product",
          body: "Managed storefront content, apparel discovery, variants, wishlist, cart, sample checkout and order history.",
        },
        {
          title: "Configured for your brand",
          body: "Collections, product data, photography, sizing, campaign content, languages and commercial policies.",
        },
        {
          title: "Connected before launch",
          body: "Production payments, stock authority, tax, delivery, returns and customer service integrations.",
        },
      ],
      faqKicker: "Before you begin",
      faqHeading: "Questions worth answering.",
      faq: [
        {
          question: "Can we use our own brand and collection structure?",
          answer:
            "Yes. The storefront is a starting point for your brand, merchandising and product catalogue. The adoption scope should define your content model, variants and operational requirements.",
        },
        {
          question: "Does the sample checkout take real payments?",
          answer:
            "The reference journey uses a sample payment flow. A production payment provider and its operational handling must be connected and validated before trading.",
        },
        {
          question: "Can we add our delivery and returns systems?",
          answer:
            "Yes, through a scoped integration. Delivery promises, fulfilment status and returns policy should reflect your actual operational systems.",
        },
      ],
    },
  },
  record97: {
    code: "nexusProductElectronicsHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Device commerce",
      heading: "Agora Electronics",
      breadcrumbLabel: "Agora Electronics",
      body: "Make devices easier to discover and buy with a focused catalogue, product details and a connected checkout.",
      referenceImageCode: "nexusProduct-electronics-home",
      imageAlt: "Agora Electronics reference storefront",
      imageTreatment: "soft-focus",
      breadcrumbParentHref: "/products",
      breadcrumbParentLabel: "Products",
    },
  },
  record98: {
    code: "nexusProductElectronicsStory",
    typeCode: "nexusProductStoryType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "agora-electronics",
      kicker: "Device commerce",
      heading: "Help customers find the device that fits their day.",
      body: "Create a focused shopping destination for phones, computers and connected devices. Agora Electronics combines category-led discovery with product information and a familiar buying journey, giving retailers a practical starting point for a branded device store.",
      audience:
        "Device retailers, electronics brands and specialist resellers.",
      outcomes: [
        {
          title: "Organise a complex range",
          body: "Give devices and categories a clear place in the storefront so customers can find a relevant starting point.",
        },
        {
          title: "Bring product information closer",
          body: "Present the details shoppers need to understand the devices they are considering.",
        },
        {
          title: "Connect browsing and buying",
          body: "Carry selected products into a shared cart, sample checkout and account experience.",
        },
      ],
      tourKicker: "A closer look",
      tourHeading: "See the experience.",
      tourBody:
        "Explore the running electronics storefront, its device listing and the mobile experience. Product records and prices shown are sample content.",
      gallery: [
        {
          label: "Desktop storefront",
          referenceImageCode: "nexusProduct-electronics-home",
          imageAlt: "Agora Electronics desktop home screen",
          caption:
            "A captured screen of the running Agora Electronics reference experience. Sample content is shown.",
          format: "desktop",
        },
        {
          label: "Device catalogue",
          referenceImageCode: "nexusProduct-electronics-shop",
          imageAlt: "Agora Electronics device catalogue",
          caption:
            "The reference device catalogue shows search, category navigation, sorting and sample device offers.",
          format: "desktop",
        },
        {
          label: "Mobile experience",
          referenceImageCode: "nexusProduct-electronics-mobile",
          imageAlt: "Agora Electronics mobile storefront",
          caption:
            "The reference storefront at a mobile viewport. Branding and content can be adapted during adoption.",
          format: "mobile",
        },
      ],
      capabilitiesKicker: "What the product brings",
      capabilitiesHeading: "A connected set of capabilities.",
      capabilities: [
        {
          title: "Device storefront",
          body: "Use focused campaign and category content to introduce the device range.",
        },
        {
          title: "Search and sorting",
          body: "Help customers find products and order the available range through familiar discovery controls.",
        },
        {
          title: "Category navigation",
          body: "Organise electronics such as computing and smartphones around shopper intent.",
        },
        {
          title: "Product detail experience",
          body: "Present imagery, descriptions and available product specifications in a consistent view.",
        },
        {
          title: "Cart and sample checkout",
          body: "Connect selected devices to the cart and order flow using the reference commerce journey.",
        },
        {
          title: "Customer account",
          body: "Support saved choices and order history through the shared account experience.",
        },
      ],
      workflowKicker: "The business journey",
      workflowHeading: "How the experience comes together.",
      workflow: [
        {
          title: "Explore devices",
          body: "Start with a category, campaign or product search.",
        },
        {
          title: "Review the details",
          body: "Open a product and inspect the available information.",
        },
        {
          title: "Place the order",
          body: "Review the cart and complete the configured checkout.",
        },
        {
          title: "Follow the purchase",
          body: "Return to the customer account and order history.",
        },
      ],
      adoptionKicker: "Make it yours",
      adoptionHeading: "A clear path from reference to launch.",
      adoptionBody:
        "Review the experience with your team, agree the operational scope and tailor the product to the people you serve.",
      adoption: [
        {
          title: "Available in the reference product",
          body: "Device storefront, catalogue browsing, product details, cart, sample checkout and customer account.",
        },
        {
          title: "Configured for your range",
          body: "Categories, specifications, brand content, prices, currencies, warranty information and commercial policies.",
        },
        {
          title: "Connected before launch",
          body: "Live stock, payments, delivery, warranty fulfilment and after-sales service integrations.",
        },
      ],
      faqKicker: "Before you begin",
      faqHeading: "Questions worth answering.",
      faq: [
        {
          question: "Can the catalogue support our device specifications?",
          answer:
            "The product-information model and detail presentation can be shaped around your range. Confirm the required specification fields, variants and comparison needs during adoption.",
        },
        {
          question: "Are payments and stock connected to a live retailer?",
          answer:
            "The reference uses sample catalogue and payment behaviour. Live stock and production payments require your chosen integrations and launch validation.",
        },
        {
          question: "Are warranty and repairs included?",
          answer:
            "Warranty information can form part of your product content. Warranty fulfilment, repairs and after-sales workflows need to be scoped against your operational systems.",
        },
      ],
    },
  },
  record99: {
    code: "nexusProductTelcoHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Plan & device commerce",
      heading: "Agora Telco",
      breadcrumbLabel: "Agora Telco",
      body: "Present prepaid and postpaid offers through a branded storefront with a familiar commerce journey.",
      referenceImageCode: "nexusProduct-telco-home",
      imageAlt: "Agora Telco reference storefront",
      imageTreatment: "soft-focus",
      breadcrumbParentHref: "/products",
      breadcrumbParentLabel: "Products",
    },
  },
  record100: {
    code: "nexusProductTelcoStory",
    typeCode: "nexusProductStoryType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "agora-telco",
      kicker: "Plan & device commerce",
      heading: "Give your connectivity offers a clear digital storefront.",
      body: "Bring plan-led merchandising into a familiar commerce experience. Agora Telco is a storefront accelerator for presenting prepaid and postpaid offers, shaping discovery and connecting the customer to a configured sales journey.",
      audience: "Telecom brands, service resellers and digital sales teams.",
      outcomes: [
        {
          title: "Make offers approachable",
          body: "Present plan categories and campaign content in a focused customer-facing storefront.",
        },
        {
          title: "Create a consistent sales experience",
          body: "Reuse familiar discovery, product detail and cart interactions across the offer range.",
        },
        {
          title: "Start with a visible customer journey",
          body: "Review the storefront with business teams before connecting the carrier operations required for launch.",
        },
      ],
      tourKicker: "A closer look",
      tourHeading: "See the experience.",
      tourBody:
        "See the running telecom storefront, sample prepaid and postpaid catalogue, and mobile presentation. Carrier activation is outside this reference tour.",
      gallery: [
        {
          label: "Desktop storefront",
          referenceImageCode: "nexusProduct-telco-home",
          imageAlt: "Agora Telco desktop home screen",
          caption:
            "A captured screen of the running Agora Telco reference experience. Sample content is shown.",
          format: "desktop",
        },
        {
          label: "Plan catalogue",
          referenceImageCode: "nexusProduct-telco-shop",
          imageAlt: "Agora Telco plan catalogue",
          caption:
            "The sample catalogue presents prepaid and postpaid offers. Displayed prices do not represent a live carrier service.",
          format: "desktop",
        },
        {
          label: "Mobile experience",
          referenceImageCode: "nexusProduct-telco-mobile",
          imageAlt: "Agora Telco mobile storefront",
          caption:
            "The reference storefront at a mobile viewport. Branding and content can be adapted during adoption.",
          format: "mobile",
        },
      ],
      capabilitiesKicker: "What the product brings",
      capabilitiesHeading: "A connected set of capabilities.",
      capabilities: [
        {
          title: "Plan-led storefront",
          body: "Introduce connectivity offers through managed campaigns and a dedicated storefront.",
        },
        {
          title: "Prepaid and postpaid categories",
          body: "Organise plan discovery around the categories shown in the reference catalogue.",
        },
        {
          title: "Search and sorting",
          body: "Provide familiar catalogue controls for navigating the available sample offers.",
        },
        {
          title: "Offer detail presentation",
          body: "Use the product detail experience to explain configured offer information.",
        },
        {
          title: "Shared commerce journey",
          body: "Use the Agora cart, account and sample checkout foundation as the starting point for a sales flow.",
        },
        {
          title: "Brand and catalogue configuration",
          body: "Shape navigation, campaign content and product records around a telecom brand or reseller.",
        },
      ],
      workflowKicker: "The business journey",
      workflowHeading: "How the experience comes together.",
      workflow: [
        {
          title: "Discover an offer",
          body: "Enter through a campaign or plan category.",
        },
        {
          title: "Review plan information",
          body: "Read the configured offer details and commercial terms.",
        },
        {
          title: "Build a sales journey",
          body: "Use the commerce flow as the basis for the selected offer.",
        },
        {
          title: "Connect service operations",
          body: "Add and validate eligibility, activation and billing integrations for your launch.",
        },
      ],
      adoptionKicker: "Make it yours",
      adoptionHeading: "A clear path from reference to launch.",
      adoptionBody:
        "Review the experience with your team, agree the operational scope and tailor the product to the people you serve.",
      adoption: [
        {
          title: "Available in the reference product",
          body: "A telecom storefront with sample prepaid and postpaid offers and the shared Agora commerce experience.",
        },
        {
          title: "Configured for your business",
          body: "Offer catalogue, commercial terms, brand, content and the intended acquisition journey.",
        },
        {
          title: "Connected before launch",
          body: "Identity checks, eligibility, SIM or eSIM activation, provisioning, number porting and recurring billing.",
        },
      ],
      faqKicker: "Before you begin",
      faqHeading: "Questions worth answering.",
      faq: [
        {
          question:
            "Is Agora Telco a carrier billing or provisioning platform?",
          answer:
            "No. It is a commerce storefront accelerator. Carrier billing, service provisioning, activation and number portability are separate integrations.",
        },
        {
          question: "Can customers activate a SIM in the reference experience?",
          answer:
            "The reference catalogue does not prove a live activation journey. SIM and eSIM activation require carrier integration, identity and eligibility checks, and operational validation.",
        },
        {
          question: "Can we extend the sales flow for our offers?",
          answer:
            "Yes. Adoption should define offer rules, required customer information and the carrier systems that complete the service journey.",
        },
      ],
    },
  },
  record101: {
    code: "nexusSolutionsHero",
    typeCode: "nexusPageHeroType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      kicker: "Nodics solutions",
      heading: "Built around what\nyour business needs.",
      breadcrumbLabel: "Solutions",
      body: "Connect work. Make sense of data. Shape a solution with the right foundations and a clear purpose.",
      referenceImageCode: "nodicsModularHero",
      imageAlt: "Composable enterprise capabilities",
    },
  },
  record102: {
    code: "nexusSolutionsContent",
    typeCode: "nexusSolutionsType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "solution-directions",
      mode: "detail",
      kicker: "From challenge to possibility",
      heading: "Where can we make a difference?",
      body: "Start with the work you need to improve. We connect the business context, the right capabilities and a practical delivery plan.",
      items: [
        {
          code: "task-execution",
          category: "Orchestrate operations",
          title: "Task Execution Engine",
          headline: "Make complex work flow.",
          summary:
            "Connect scheduled tasks, dependencies and recovery into an operational flow your teams can understand and manage.",
          visual: "operations",
          flow: ["Trigger", "Coordinate", "Execute", "Review"],
          centerLabel: "One coordinated flow",
          tags: ["Scheduled work", "Recovery paths", "Operational visibility"],
          href: "/solutions#task-execution",
          linkLabel: "Explore task execution",
          challenge:
            "When business-critical work depends on disconnected jobs, teams spend time chasing failures and piecing together what happened.",
          useCases: [
            {
              title: "Recurring operations",
              text: "Scope scheduled business runs, reconciliation and routine processing across connected systems.",
            },
            {
              title: "Cross-system handoffs",
              text: "Define dependencies, ownership and completion signals for work spanning multiple applications.",
            },
            {
              title: "Exception recovery",
              text: "Agree retry rules, escalation paths and the evidence operators need to recover safely.",
            },
          ],
          scope: [
            "Triggers, schedules and task dependencies",
            "Execution boundaries, access and integration contracts",
            "Retries, timeouts and human intervention",
            "Run history, alerts and operational ownership",
          ],
          outcome:
            "A shared view of what should run, what happened and what needs attention.",
          scopeLabel: "What we define together",
          outcomeLabel: "The intended outcome",
        },
        {
          code: "data-analytics",
          category: "Connect data to decisions",
          title: "Data Engineering & Analytics",
          headline: "Give your data a direction.",
          summary:
            "Bring fragmented sources into a governed data journey, from ingestion and quality checks to insight that supports everyday decisions.",
          visual: "data",
          flow: ["Sources", "Refine", "Govern", "Insight"],
          centerLabel: "Insight with context",
          tags: ["Connected sources", "Data quality", "Business insight"],
          href: "/solutions#data-analytics",
          linkLabel: "Explore data & analytics",
          challenge:
            "When teams work from scattered reports and inconsistent definitions, even simple business questions become difficult to answer with confidence.",
          useCases: [
            {
              title: "Operational reporting",
              text: "Bring agreed business measures together across applications, teams and reporting cycles.",
            },
            {
              title: "Data consolidation",
              text: "Map fragmented source data into consistent structures with clear lineage and ownership.",
            },
            {
              title: "Decision support",
              text: "Define the views, refresh needs and quality thresholds that make insight useful to its audience.",
            },
          ],
          scope: [
            "Sources, destinations and refresh expectations",
            "Transformations, definitions and quality checks",
            "Access, lineage, retention and data ownership",
            "Reporting audiences and acceptance measures",
          ],
          outcome:
            "A traceable path from source information to business insight, with quality and ownership made explicit.",
          scopeLabel: "What we define together",
          outcomeLabel: "The intended outcome",
        },
      ],
      workflowLabel: "A possible solution flow",
      useCasesLabel: "Where this could help",
      journeyKicker: "A clear path forward",
      journeyHeading: "Start focused. Build with purpose.",
      journeyBody:
        "We establish scope and acceptance criteria together before moving into implementation.",
      steps: [
        {
          title: "Discover",
          text: "Understand the business problem, people, existing systems and desired outcomes.",
        },
        {
          title: "Design",
          text: "Agree the solution boundaries, integrations, governance and acceptance criteria.",
        },
        {
          title: "Build & validate",
          text: "Implement a focused scope and test it against the agreed business and operational needs.",
        },
        {
          title: "Prepare to operate",
          text: "Qualify deployment, ownership, monitoring and support before a production rollout.",
        },
      ],
      ctaKicker: "Let’s shape your next move",
      ctaHeading: "Bring the challenge.\nWe’ll work through it together.",
      ctaBody:
        "Tell us what your teams are trying to achieve, which systems are involved and where progress gets difficult.",
      href: "/contact",
      linkLabel: "Discuss your solution",
      footnote:
        "These are solution directions for project discovery. Capabilities, delivery scope and production readiness are agreed and validated for each engagement.",
    },
  },
  record103: {
    code: "nexusHomeSolutions",
    typeCode: "nexusSolutionsType",
    accessMode: "PUBLIC",
    active: true,
    properties: {
      anchor: "solutions",
      mode: "overview",
      kicker: "Built around your business",
      heading: "Your challenge.\nOur starting point.",
      body: "Every organisation has work that could flow better and data that could do more. Explore two solution directions we can shape with your team.",
      items: [
        {
          code: "task-execution",
          category: "Orchestrate operations",
          title: "Task Execution Engine",
          headline: "Make complex work flow.",
          summary:
            "Connect scheduled tasks, dependencies and recovery into an operational flow your teams can understand and manage.",
          visual: "operations",
          flow: ["Trigger", "Coordinate", "Execute", "Review"],
          centerLabel: "One coordinated flow",
          tags: ["Scheduled work", "Recovery paths", "Operational visibility"],
          href: "/solutions#task-execution",
          linkLabel: "Explore task execution",
          challenge:
            "When business-critical work depends on disconnected jobs, teams spend time chasing failures and piecing together what happened.",
          useCases: [
            {
              title: "Recurring operations",
              text: "Scope scheduled business runs, reconciliation and routine processing across connected systems.",
            },
            {
              title: "Cross-system handoffs",
              text: "Define dependencies, ownership and completion signals for work spanning multiple applications.",
            },
            {
              title: "Exception recovery",
              text: "Agree retry rules, escalation paths and the evidence operators need to recover safely.",
            },
          ],
          scope: [
            "Triggers, schedules and task dependencies",
            "Execution boundaries, access and integration contracts",
            "Retries, timeouts and human intervention",
            "Run history, alerts and operational ownership",
          ],
          outcome:
            "A shared view of what should run, what happened and what needs attention.",
          scopeLabel: "What we define together",
          outcomeLabel: "The intended outcome",
        },
        {
          code: "data-analytics",
          category: "Connect data to decisions",
          title: "Data Engineering & Analytics",
          headline: "Give your data a direction.",
          summary:
            "Bring fragmented sources into a governed data journey, from ingestion and quality checks to insight that supports everyday decisions.",
          visual: "data",
          flow: ["Sources", "Refine", "Govern", "Insight"],
          centerLabel: "Insight with context",
          tags: ["Connected sources", "Data quality", "Business insight"],
          href: "/solutions#data-analytics",
          linkLabel: "Explore data & analytics",
          challenge:
            "When teams work from scattered reports and inconsistent definitions, even simple business questions become difficult to answer with confidence.",
          useCases: [
            {
              title: "Operational reporting",
              text: "Bring agreed business measures together across applications, teams and reporting cycles.",
            },
            {
              title: "Data consolidation",
              text: "Map fragmented source data into consistent structures with clear lineage and ownership.",
            },
            {
              title: "Decision support",
              text: "Define the views, refresh needs and quality thresholds that make insight useful to its audience.",
            },
          ],
          scope: [
            "Sources, destinations and refresh expectations",
            "Transformations, definitions and quality checks",
            "Access, lineage, retention and data ownership",
            "Reporting audiences and acceptance measures",
          ],
          outcome:
            "A traceable path from source information to business insight, with quality and ownership made explicit.",
          scopeLabel: "What we define together",
          outcomeLabel: "The intended outcome",
        },
      ],
      href: "/solutions",
      linkLabel: "Discover our approach",
      footnote:
        "Solution directions, shaped through discovery to match your systems, people and priorities.",
    },
  },
};
