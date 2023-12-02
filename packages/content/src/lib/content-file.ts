interface AngularComponentData {
  name: string;
  inputs: Record<string, any>;
}

export interface ContentFile<
  Attributes extends Record<string, any> = Record<string, any>
> {
  filename: string;
  slug: string;
  content?: string;
  attributes: Attributes;
  ngComponents?: AngularComponentData[];
}
