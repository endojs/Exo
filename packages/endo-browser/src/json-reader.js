/* Adapts a Reader<Uint8Array> to a JSON object Reader<any> where reader and
 * writer streeams are modeled as hybrid async iterators + generators.
 */
const textDecoder = new TextDecoder();

export async function* jsonReader(reader) {
  for await (const bytes of reader) {
    const text = textDecoder.decode(bytes);
    yield JSON.parse(text);
  }
}
