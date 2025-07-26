export const id          = "GR_SEM_BOUNDARY";
export const description = "Semantic matcher for boundary-setting phrases";

export async function run(text, utils, meta) {
  // ➊ use cached embedding from meta if available
  const refEmb = meta.embedding ?? await utils.embed(meta.examples);
  const sim    = utils.cosine(await utils.embed([text]), refEmb);
  return sim > 0.75
      ? { fire: ["S_BOUNDARY_SETTING"], score: Number(sim.toFixed(2)) }
      : { fire: [], score: Number(sim.toFixed(2)) };
}
