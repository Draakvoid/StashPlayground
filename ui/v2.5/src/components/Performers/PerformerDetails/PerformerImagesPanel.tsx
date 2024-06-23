import React from "react";
import * as GQL from "src/core/generated-graphql";
import { ImageList } from "src/components/Images/ImageList";
import { usePerformerFilterHook } from "src/core/performers";

interface IPerformerImagesPanel {
  active: boolean;
  performer: GQL.PerformerDataFragment;
}

export const PerformerImagesPanel: React.FC<IPerformerImagesPanel> = ({
  active,
  performer,
}) => {
  const filterHook = usePerformerFilterHook(performer);
  return <ImageList filterHook={filterHook} alterQuery={active} />;
};
