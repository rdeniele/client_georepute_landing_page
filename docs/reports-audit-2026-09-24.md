# Sample reports: numerical and technical audit (2026-09-24)

Client request: verify there are no numerical or technical errors in the reports before they go live.
Method: every figure that could be recomputed was recomputed from the report's own data (CSV export, tables, or the numbers printed in the report itself).

## Fixed in the published PDFs

| Report | Issue | Fix |
| --- | --- | --- |
| AI Visibility | Rank table listed AirOps (9 mentions) at #8 and Empler AI (16) at #9, against the mention counts and the share-of-voice table | Rows swapped to #8 Empler AI, #9 AirOps |
| AI Visibility | Three charts (Mentions by Platform, Mention Rate, Sentiment by Platform) rendered as blank frames | Added a note saying there are no mentions to plot |
| Keyword Research | 10,660 combined monthly volume overstated demand: 191 keywords sit at the minimum reported volume (10) and near-duplicate phrasings repeat the same volume | Stated as an upper bound, with the 191/1,910 figure, in summary, observations and methodology |
| Keyword Research | CPC average covers 63 of 306 keywords | Stated in observations |
| Keyword Intelligence | Recommendation is not a cutoff on Paid Score (12 keywords with Paid Score 60+ are Protect Organic, all with CPC of $6.67+ or none) | Stated in methodology |
| War Room | Source landscape included five entries for people from an unrelated political system (name-matching error) | Removed, with a footnote |
| War Room | Every influence source has authority 45.4 and type "Other" (unscored defaults) | Footnote: read as a source list, not a ranking |
| Search Performance | Daily values were read from a dashboard chart; page impressions sum to 52 against a property total of 40 | Both disclosed in notes (page vs property counting is how Search Console aggregates) |

## Open items: need the client or the data owner

AI Visibility report
1. Mentions vs coverage: HubSpot Content Hub shows 122 mentions (98% of 124 queries) but 27% on the "Competitor vs Brand Visibility" chart. Sight AI (62 mentions = 50%) shows 46%; Empler AI (16 = 13%) shows 11%; Distribution.ai (4 = 3%) shows 2%. Jasper, Writesonic, Surfer SEO, MarketMuse, Floyi and AirOps do match mentions/124. Confirm the definition of each measure.
2. "Top competitor" is Jasper (89% visibility) but the share-of-voice leader is HubSpot Content Hub (23.1%). Two different measures; label them.
3. Keywords: "ai content platform" (109 related queries) + "best ai content platform" (41) = 150, more than the 124 queries analysed. Confirm the unit.
4. Positioning table shows 0% market share for every brand while share of voice is 23% for the leader.

MDD Decision Case
1. Engine visibility is 0% ("named in 0% of answers") but four engines show a top-3 placement (1 each; 11.1%, 14.3%, 5.9%, 6.3%) and recommendation share is 6.7%. An engine that does not name the brand cannot place it top-3. The 6.7% is internally consistent (4 of about 60), so the contradiction is between 0% and 6.7%.
2. Decision principle says "no measured organic positions" while the same case reports average position 9.7 on 578 impressions and a measured Google #2.
3. Client inputs conflict: target CPL $25 and close rate 2.5% imply a CPA of $1,000, not the stated $150, and above the $474 average transaction value.
4. "$46,096/year existing demand not captured" is not produced by any formula in the metrics table and exceeds the top of the $4,270 to $42,700 opportunity range.
5. Cover says "19 sections" but the navigation has 22.
6. "Grok: not yet integrated" here, while the AI Visibility report lists "Groq" as a live platform. One is a typo.
7. 90-Day Delivery Plan repeats the same deliverable text several times per row (template repetition).
8. Target Market table: the Israel row has no "current evidence" cell.

War Room
1. Momentum is 35.6 in the overview but the forecast "Public presence momentum" shows 27.6. Confirm they are different measures.

## Verified without issues
- AI Visibility: platform queries 24+12+24+16+24+24 = 124; share of voice sums to 100.0% and matches mentions; average competitor visibility 34.6% = 35%.
- Search Performance: CTRs recompute; daily clicks/impressions sum to 3/40; impression-weighted position 12.3.
- Keyword reports: 306 = 130+37+16+123 (competition) = 62+174+70 (trend) = 254+39+10+3 (recommendation) = 154+126+20+4+2 (GEON bands); volume bands sum to 10,660; averages recompute.
- War Room: 115 = 20+20+20+20+20+15; per-engine visibility equals overview 59.3; forecast values match overview.
- MDD: Campaign Intelligence Score recomputes to about 12 (12.5 from the stated weights); 854 x 2.5% x $200 = $4,270 and x $2,000 = $42,700; 11/14 = 79%.
