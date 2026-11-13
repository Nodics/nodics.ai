/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nexus.web/data/nexusTypeCodeData @description Nexus component type definitions for governed WCMS Staged import. @owner nexus.web @layer data */
module.exports = {
  "record0": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusCorporateHomePageType",
    "kind": "PAGE",
    "contractVersion": 0,
    "active": true
  },
  "record1": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusCorporateStandardPageType",
    "kind": "PAGE",
    "contractVersion": 0,
    "active": true
  },
  "record2": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusPageHeroType",
    "kind": "COMPONENT",
    "propertySchema": {
      "title": {
        "localized": true,
        "requiredLocales": [
          "en"
        ]
      },
      "body": {
        "localized": true
      }
    },
    "contractVersion": 0,
    "active": true
  },
  "record3": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusBannerCarouselType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true
  },
  "record4": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusBannerSlideType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true,
    "propertySchema": {
      "title": {
        "localized": true
      },
      "heading": {
        "localized": true
      },
      "subheading": {
        "localized": true
      },
      "imageAlt": {
        "localized": true
      },
      "buttons": {
        "localized": true
      }
    }
  },
  "record5": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusContentSectionType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true,
    "propertySchema": {
      "kicker": {
        "localized": true
      },
      "heading": {
        "localized": true
      },
      "body": {
        "localized": true
      },
      "metrics": {
        "localized": true
      },
      "linkLabel": {
        "localized": true
      },
      "href": {
        "localized": true
      },
      "imageAlt": {
        "localized": true
      }
    }
  },
  "record6": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusCardGridType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true,
    "propertySchema": {
      "kicker": {
        "localized": true
      },
      "heading": {
        "localized": true
      },
      "imageAlt": {
        "localized": true
      },
      "linkLabel": {
        "localized": true
      },
      "href": {
        "localized": true
      },
      "items": {
        "localized": true
      },
      "body": {
        "localized": true
      },
      "statements": {
        "localized": true
      }
    }
  },
  "record7": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusTechnologyType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true,
    "propertySchema": {
      "kicker": {
        "localized": true
      },
      "heading": {
        "localized": true
      },
      "imageAlt": {
        "localized": true
      },
      "items": {
        "localized": true
      }
    }
  },
  "record8": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusGithubType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true,
    "propertySchema": {
      "kicker": {
        "localized": true
      },
      "heading": {
        "localized": true
      },
      "body": {
        "localized": true
      },
      "organizationLabel": {
        "localized": true
      },
      "developerKicker": {
        "localized": true
      },
      "developerHeading": {
        "localized": true
      },
      "developerBody": {
        "localized": true
      },
      "developerLinkLabel": {
        "localized": true
      },
      "developerHref": {
        "localized": true
      },
      "imageAlt": {
        "localized": true
      },
      "repositoryIntro": {
        "localized": true
      },
      "repositories": {
        "localized": true
      }
    }
  },
  "record9": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusTestimonialsType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true,
    "propertySchema": {
      "kicker": {
        "localized": true
      },
      "heading": {
        "localized": true
      },
      "body": {
        "localized": true
      },
      "emptyMessage": {
        "localized": true
      },
      "items": {
        "localized": true
      }
    }
  },
  "record10": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusNewsCarouselType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true,
    "propertySchema": {
      "kicker": {
        "localized": true
      },
      "heading": {
        "localized": true
      },
      "linkLabel": {
        "localized": true
      },
      "href": {
        "localized": true
      },
      "items": {
        "localized": true
      },
      "emptyMessage": {
        "localized": true
      }
    }
  },
  "record11": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusBlogCarouselType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true,
    "propertySchema": {
      "kicker": {
        "localized": true
      },
      "heading": {
        "localized": true
      },
      "linkLabel": {
        "localized": true
      },
      "href": {
        "localized": true
      },
      "items": {
        "localized": true
      },
      "emptyMessage": {
        "localized": true
      }
    }
  },
  "record12": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusContactType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true,
    "propertySchema": {
      "kicker": {
        "localized": true
      },
      "heading": {
        "localized": true
      },
      "body": {
        "localized": true
      },
      "href": {
        "localized": true
      },
      "linkLabel": {
        "localized": true
      },
      "items": {
        "localized": true
      },
      "imageAlt": {
        "localized": true
      },
      "formKicker": {
        "localized": true
      },
      "formHeading": {
        "localized": true
      },
      "formBody": {
        "localized": true
      },
      "formFields": {
        "localized": true
      },
      "formSubmitLabel": {
        "localized": true
      },
      "formStatus": {
        "localized": true
      },
      "formVisualCaption": {
        "localized": true
      }
    }
  },
  "record13": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusEditorialListingType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true
  },
  "record14": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusEditorialCardType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true
  },
  "record15": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusEditorialDetailType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true
  },
  "record16": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusEditorialFeaturedType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true
  },
  "record17": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusEditorialLatestType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true
  },
  "record18": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusEditorialTaxonomyType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true
  },
  "record19": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusEditorialAuthorType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true
  },
  "record20": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusEditorialRelatedType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true
  },
  "record21": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusEditorialSeriesType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true
  },
  "record22": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusCorporateSiteHeaderType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true,
    "propertySchema": {
      "navigation": {
        "localized": true
      }
    }
  },
  "record23": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusCorporateSiteFooterType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true,
    "propertySchema": {
      "brandSummary": {
        "localized": true
      },
      "contactHeading": {
        "localized": true
      },
      "groups": {
        "localized": true
      },
      "legalText": {
        "localized": true
      },
      "legalLinks": {
        "localized": true
      }
    }
  },
  "record24": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusProductPortfolioType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true,
    "propertySchema": {
      "kicker": {
        "localized": true
      },
      "heading": {
        "localized": true
      },
      "body": {
        "localized": true
      },
      "linkLabel": {
        "localized": true
      },
      "href": {
        "localized": true
      },
      "previewLabel": {
        "localized": true
      },
      "showcaseNote": {
        "localized": true
      },
      "contactLabel": {
        "localized": true
      },
      "products": {
        "localized": true
      },
      "contactHref": {
        "localized": true
      }
    }
  },
  "record25": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusProductStoryType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true
  },
  "record26": {
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "nexusContentCatalog"
    },
    "code": "nexusSolutionsType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true,
    "propertySchema": {
      "kicker": {
        "localized": true
      },
      "heading": {
        "localized": true
      },
      "body": {
        "localized": true
      },
      "href": {
        "localized": true
      },
      "linkLabel": {
        "localized": true
      },
      "footnote": {
        "localized": true
      },
      "items": {
        "localized": true
      }
    }
  }
};
