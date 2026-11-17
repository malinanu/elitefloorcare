// Before/after projects (moved out of the old js/gallery.js).
// NOTE: names and venues are placeholder copy from the design — confirm with the client before launch.
export type Project = {
  id: string;
  sector: (typeof galleryFilters)[number];
  title: string;
  work: string;
  before: { src: string; alt: string };
  after: { src: string; alt: string };
};

export const galleryFilters = ["All", "Schools", "Stadiums", "Gyms", "Recreation Centres", "Community Halls"] as const;

const p = (f: string) => `/assets/photos/${f}.jpg`;

export const projects: Project[] = [
  { id: "g1", sector: "Schools", title: "Kilbryde Grammar, Ringwood", work: "Full recoat + line reset",
    before: { src: p("indoor_basketball_court_interior"), alt: "Before: dull school hall court" }, after: { src: p("basketball_court_in_sports_facility"), alt: "After: glossy recoated school court" } },
  { id: "g2", sector: "Stadiums", title: "Northvale Indoor Sports, Craigieburn", work: "4 courts recoated",
    before: { src: p("elevated_view_of_indoor_stadium"), alt: "Before: worn stadium show court" }, after: { src: p("indoor_sports_facility_view"), alt: "After: recoated stadium court under lights" } },
  { id: "g3", sector: "Recreation Centres", title: "Ferngully Leisure Centre, Knoxfield", work: "Deep clean",
    before: { src: p("leisure_centre_timber_floor_view"), alt: "Before: grey rubber-marked rec centre floor" }, after: { src: p("leisure_centre_gym_floor_cleaning"), alt: "After: clean, clear-gloss rec centre floor" } },
  { id: "g4", sector: "Community Halls", title: "Barrandale Memorial Hall, Colac", work: "Line marking re-set",
    before: { src: p("crew_member_taping_court_line-2"), alt: "Before: faded overlapping hall lines" }, after: { src: p("indoor_sports_facility_timber_floor"), alt: "After: crisp three-sport line scheme" } },
  { id: "g5", sector: "Gyms", title: "Iron Arch Strength, Braybrook", work: "Recoat + slip correction",
    before: { src: p("worn_timber_sports_floor_surface"), alt: "Before: patchy gym timber platform area" }, after: { src: p("gym_timber_platform_area"), alt: "After: even matte finish gym floor" } },
  { id: "g6", sector: "Schools", title: "St Aldwyn's College, Bendigo", work: "Deep clean + recoat",
    before: { src: p("indoor_sports_facility_timber_floor-2"), alt: "Before: chalky school gymnasium boards" }, after: { src: p("college_gymnasium_indoor_sports_"), alt: "After: recoated school gymnasium" } },
  { id: "g7", sector: "Stadiums", title: "Westgate Netball Centre, Altona", work: "6 courts recoated",
    before: { src: p("elevated_view_of_indoor_stadium"), alt: "Before: netball court with worn keys" }, after: { src: p("netball_centre_indoor_sports_fac"), alt: "After: freshly recoated netball courts" } },
  { id: "g8", sector: "Community Halls", title: "Yarrabank Shire Hall, Seymour", work: "Full sand + recoat",
    before: { src: p("worn_timber_sports_floor_surface"), alt: "Before: century-old hall floor, bare patches" }, after: { src: p("worn_timber_sports_floor_interior"), alt: "After: restored hall floor with fresh finish" } },
];
