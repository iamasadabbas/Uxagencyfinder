# Import and data notes

Source: master brief version 1.6, source revision 6, accessed 18 November 2026.

- JSON and Markdown use UTF-8. CSV uses UTF-8 with BOM and standard quoted comma-separated fields.
- Agency IDs/slugs are implementation identifiers generated consistently for this handoff. Use the same ID across agency and placement records.
- Agency names and official websites come from section 10. Aliases contain Momentum Design Lab for HTEC Momentum.
- `publication_state: draft` means imported research is available for review; it does not publish records automatically.
- Industry `position` is the exact owner-selected editorial order. There is no star rating or universal agency rank.
- All placements use `selection_basis: owner-directed` because the owner supplied the full ordering.
- CorLab Tech's `evidence_depth: service-page` identifies the explicit Logistics exception. Other records use `see-source-qualifications`; read the preserved fit/scope notes and source qualifications rather than interpreting this as a measured evidence grade.
- Source IDs preserve E01-E56 with retired gaps E02, E03, E04 and E14. There are 52 active records. Do not renumber them.
- Semicolon-separated source IDs in CSV refer to `source-register.csv`. The JSON versions use arrays.
- Industry memberships are derived from the exact ranking map. Capability tags and generic service claims do not add memberships.
- Routes with `route_type: template` contain placeholders, not literal public URLs. There are 22 fixed routes plus agency and real author route templates.
- Preserve source URLs, dates and limitations. Agency-published sources are not independently audited client outcomes.
- Before publishing, build content collections and validation as described in section 14. This export is not a substitute for the final application schema.

Checked package counts: 8 industries, 21 unique agencies, 52 placements, 52 agency sources, 22 fixed routes and 2 route templates.
