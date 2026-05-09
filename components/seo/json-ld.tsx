type JsonLdProps = {
  data: unknown | readonly unknown[];
  id: string;
};

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function JsonLd({ data, id }: Readonly<JsonLdProps>) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
      id={id}
      type="application/ld+json"
    />
  );
}

