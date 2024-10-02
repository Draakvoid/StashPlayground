import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useIntl } from "react-intl";
import * as GQL from "src/core/generated-graphql";
import NavUtils from "src/utils/navigation";
import TextUtils from "src/utils/text";
import { CountryFlag } from "../Shared/CountryFlag";
import { SweatDrops } from "../Shared/SweatDrops";
import { HoverPopover } from "../Shared/HoverPopover";
import { Icon } from "../Shared/Icon";
import { TagLink } from "../Shared/TagLink";
import { Button, ButtonGroup } from "react-bootstrap";
import { Criterion, CriterionValue } from "src/models/list-filter/criteria/criterion";
import { PopoverCountButton } from "../Shared/PopoverCountButton";
import GenderIcon from "./GenderIcon";
import { faTag } from "@fortawesome/free-solid-svg-icons";
import { RatingBanner } from "../Shared/RatingBanner";
import { usePerformerUpdate } from "src/core/StashService";
import { ILabeledId } from "src/models/list-filter/types";
import ScreenUtils from "src/utils/screen";
import { FavoriteIcon } from "../Shared/FavoriteIcon";
import { toLower } from "lodash-es";
import { Tilt } from "react-tilt";

export interface IPerformerCardExtraCriteria {
  scenes?: Criterion<CriterionValue>[];
  images?: Criterion<CriterionValue>[];
  galleries?: Criterion<CriterionValue>[];
  movies?: Criterion<CriterionValue>[];
  performer?: ILabeledId;
}

interface IPerformerCardProps {
  performer: GQL.PerformerDataFragment;
  containerWidth?: number;
  ageFromDate?: string;
  selecting?: boolean;
  selected?: boolean;
  onSelectedChanged?: (selected: boolean, shiftKey: boolean) => void;
  extraCriteria?: IPerformerCardExtraCriteria;
}

export const PerformerCardTilt: React.FC<IPerformerCardProps> = ({
  performer,
  containerWidth,
  ageFromDate,
  selecting,
  selected,
  onSelectedChanged,
  extraCriteria,
}) => {
  const intl = useIntl();
  
  const age = TextUtils.age(
    performer.birthdate,
    ageFromDate ?? performer.death_date
  );
  const ageL10nId = ageFromDate
    ? "media_info.performer_card.age_context"
    : "media_info.performer_card.age";
  const ageL10String = intl.formatMessage({
    id: "years_old",
    defaultMessage: "years old",
  });
  const ageString = intl.formatMessage(
    { id: ageL10nId },
    { age, years_old: ageL10String }
  );

  const [updatePerformer] = usePerformerUpdate();

  function onToggleFavorite(v: boolean) {
    if (performer.id) {
      updatePerformer({
        variables: {
          input: {
            id: performer.id,
            favorite: v,
          },
        },
      });
    }
  }

  function maybeRenderScenesPopoverButton() {
    if (!performer.scene_count) return null;

    return (
      <PopoverCountButton
        className="scene-count"
        type="scene"
        count={performer.scene_count}
        url={NavUtils.makePerformerScenesUrl(
          performer,
          extraCriteria?.performer,
          extraCriteria?.scenes
        )}
      />
    );
  }

  function maybeRenderImagesPopoverButton() {
    if (!performer.image_count) return null;

    return (
      <PopoverCountButton
        className="image-count"
        type="image"
        count={performer.image_count}
        url={NavUtils.makePerformerImagesUrl(
          performer,
          extraCriteria?.performer,
          extraCriteria?.images
        )}
      />
    );
  }

  function maybeRenderGalleriesPopoverButton() {
    if (!performer.gallery_count) return null;

    return (
      <PopoverCountButton
        className="gallery-count"
        type="gallery"
        count={performer.gallery_count}
        url={NavUtils.makePerformerGalleriesUrl(
          performer,
          extraCriteria?.performer,
          extraCriteria?.galleries
        )}
      />
    );
  }

  function maybeRenderOCounter() {
    if (!performer.o_counter) return null;

    return (
      <div className="o-counter">
        <Button className="minimal">
          <span className="fa-icon">
            <SweatDrops />
          </span>
          <span>{performer.o_counter}</span>
        </Button>
      </div>
    );
  }

  function maybeRenderTagPopoverButton() {
    if (performer.tags.length <= 0) return null;

    const popoverContent = performer.tags.map((tag) => (
      <TagLink key={tag.id} linkType="performer" tag={tag} />
    ));

    return (
      <HoverPopover placement="bottom" content={popoverContent}>
        <Button className="minimal tag-count">
          <Icon icon={faTag} />
          <span>{performer.tags.length}</span>
        </Button>
      </HoverPopover>
    );
  }

  function maybeRenderGroupsPopoverButton() {
    if (!performer.movie_count) return null;

    return (
      <PopoverCountButton
        className="group-count"
        type="group"
        count={performer.movie_count}
        url={NavUtils.makePerformerGroupsUrl(
          performer,
          extraCriteria?.performer,
          extraCriteria?.movies
        )}
      />
    );
  }

  function maybeRenderRatingBanner() {
    if (!performer.rating100) {
      return null;
    }
    return <RatingBanner rating={performer.rating100} />;
  }

  function maybeRenderFlag() {
    if (performer.country) {
      return (
        <Link to={NavUtils.makePerformersCountryUrl(performer)}>
          <CountryFlag
            className="performer-card__country-flag"
            country={performer.country}
            includeOverlay
          />
          <span className="performer-card__country-string">
            {performer.country}
          </span>
        </Link>
      );
    }
    return null;
  }

  return (
    <Tilt
      className="tilt-root performer-card"
      options={{
        max: 25,
        perspective: 1000,
        scale: 1.05,
        speed: 300,
        transition: true,
        reset: true,
        easing: "cubic-bezier(.03,.98,.52,.99)",
      }}
    >
      <div className="tilt-child">
        <a href={`/performers/${performer.id}`} className="performer-card-link">
          <div className="performer-card-inner">
            <div className="performer-card-top">
              <div className="performer-card-image-container">
                <img
                  loading="lazy"
                  className="performer-card-image"
                  alt={performer.name ?? ""}
                  src={performer.image_path ?? ""}
                />
              </div>
              <div className="performer-card-title">
                <span className="performer-name">{performer.name}</span>
                {performer.disambiguation && (
                  <span className="performer-disambiguation">
                    {" "}
                    ({performer.disambiguation})
                  </span>
                )}
              </div>
              <FavoriteIcon
                favorite={performer.favorite}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
            <div className="performer-card-details">
              <div className="performer-card-age">{ageString}</div>
              <div className="performer-card-gender">
                {performer.gender && toLower(performer.gender)}
              </div>
              <div className='d-flex flex-row flex-wrap justify-content-center'>
              {maybeRenderScenesPopoverButton()}
              {maybeRenderImagesPopoverButton()}
              {maybeRenderGalleriesPopoverButton()}
              {maybeRenderTagPopoverButton()}
              {maybeRenderGroupsPopoverButton()}
              {maybeRenderOCounter()}
              </div>
              {/* {maybeRenderRatingBanner()} */}
              {maybeRenderFlag()}
            </div>
          </div>
        </a>
      </div>
    </Tilt>
  );
};
