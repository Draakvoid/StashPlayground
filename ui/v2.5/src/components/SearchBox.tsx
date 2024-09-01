import { faTimes } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import {
    Button,
    FormControl,
} from "react-bootstrap";
import * as GQL from "src/core/generated-graphql";
import { Icon } from "./Shared/Icon";
import useFocus from "src/utils/focus";
import Fuse from "fuse.js"
import { PerformerCard } from "./Performers/PerformerCard";
import { TagCard } from "./Tags/TagCard";
import { SceneCard } from "./Scenes/SceneCard";
import { StudioCard } from "./Studios/StudioCard";
import { GalleryCard } from "./Galleries/GalleryCard";
import Mousetrap from "mousetrap";
import { useHistory } from "react-router-dom";
import Gallery from "react-photo-gallery";
import { Link } from "react-router-dom";
import { useIntl } from "react-intl";
interface SBProps {}
const categories = [
    { id: "performers", label: "Performers", route: "/performers" },
    { id: "scenes", label: "Scenes", route: "/scenes" },
    { id: "galleries", label: "Galleries", route: "/galleries" },
    { id: "studios", label: "Studios", route: "/studios" },
    { id: "tags", label: "Tags", route: "/tags" }
  ];

export const SearchBox: React.FC<SBProps> = ({
}) => {
    const intl = useIntl();
    const [searchTerm, setSearch] = useState("")
    const [queryRef, setQueryFocus] = useFocus();
    const [queryClearShowing, setQueryClearShowing] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const history = useHistory();
    type SearchResult = { ShortName: string; TypeData: GQL.SlimSceneDataFragment | GQL.PerformerDataFragment | GQL.TagDataFragment | GQL.StudioDataFragment |GQL.SlimGalleryDataFragment };
    var searchResults:SearchResult[] = []
    useEffect(() => {
        Mousetrap.bind('shift+s', (e) => {
            var SearchBox = (document.getElementById("SearchBox") as HTMLInputElement)
            if ((document.activeElement as HTMLInputElement) === SearchBox) return
            e.preventDefault();
            SearchBox?.focus();
            SearchBox.value = "";
            setSearch("");
        })
        Mousetrap.bind('escape', (e) => {
            (document.getElementById("SearchBox") as HTMLInputElement).blur();
            (document.getElementById("SearchBox") as HTMLInputElement).value = "";
            setSearch("");
        })
    })
    useEffect(() => {
        if (!searchTerm) {
          if (queryRef.current) queryRef.current.value = "";
          setQueryClearShowing(false);
        }
      }, [searchTerm, queryRef]);

    function onChangeQuery(event: React.FormEvent<HTMLInputElement>) {
        setSearch(event.currentTarget.value)
        searchResults = []
    }
    function onSearchBoxClick() {
        setShowResults(true); // Show results when search box is clicked
    }
    function onClearQuery() {
        if (queryRef.current) queryRef.current.value = "";
        setSearch("");
        setQueryFocus();
        setQueryClearShowing(false);
        searchResults = []
    }  
    function getSceneResults() {
        const {data, loading} = GQL.useFindScenesQuery({
            variables: {
                filter: {
                    per_page: searchTerm != "" ? 40 : 0,
                    q: searchTerm
                },
                scene_filter: {
                    title: {
                        modifier: GQL.CriterionModifier.NotNull,
                        value: ""
                    }
                }
            }
        })
        if (!loading && searchTerm != "" && data?.findScenes.count != 0) data!.findScenes.scenes.map((scene) => searchResults.push({ShortName: scene.title!, TypeData: scene }))  
        console.info("Scenes Searched...")
    }
    function getPerfResults() {
        const {data, loading} = GQL.useFindPerformersQuery({
            variables: {
                filter: {
                    per_page: searchTerm != "" ? 40 : 0,
                    q: searchTerm
                }
            }
        })
        if (!loading && searchTerm != "" && data?.findPerformers.count != 0) data!.findPerformers.performers.map((perf) => searchResults.push({ShortName: perf.name, TypeData: perf }))
        console.info("Performers Searched...")
    }
    function getTagResults() {
        const {data, loading} = GQL.useFindTagsQuery({
            variables: {
                filter: {
                    per_page: searchTerm != "" ? 40 : 0,
                    q: searchTerm
                }
            }
        })
        if (!loading && searchTerm != "" && data?.findTags.count != 0) data!.findTags.tags.map((tag) => searchResults.push({ShortName: tag.name, TypeData: tag }))
        console.info("Tags Searched...")
    }
    function getStudioResults() {
        const {data, loading} = GQL.useFindStudiosQuery({
            variables: {
                filter: {
                    per_page: searchTerm != "" ? 40 : 0,
                    q: searchTerm
                }
            }
        })
        if (!loading && searchTerm != "" && data?.findStudios.count != 0) data!.findStudios.studios.map((studio) => searchResults.push({ShortName: studio.name!, TypeData: studio }))
        console.info("Studios Searched...")

    }
    function getGalleryResults() {
        const {data, loading} = GQL.useFindGalleriesQuery({
            variables: {
                filter: {
                    per_page: searchTerm != "" ? 40 : 0,
                    q: searchTerm
                },
                gallery_filter: {
                    title: {
                        modifier: GQL.CriterionModifier.NotNull,
                        value: ""
                    }
                }
            }
        })
        if (!loading && searchTerm != "" && data?.findGalleries.count != 0) data!.findGalleries.galleries.map((gallery) => searchResults.push({ShortName: gallery.title!, TypeData: gallery }))  
        console.info("Galleries Searched...")
    }
    function getSearchResults() {
        getSceneResults();
        getTagResults();
        getPerfResults();
        getStudioResults();
        getGalleryResults();
    
        useEffect(() => {
            Mousetrap.bind('enter', (e) => {
                if (searchTerm === "") return;
                goToFirstResult();
                (document.getElementById("SearchBox") as HTMLInputElement).blur();
                (document.getElementById("SearchBox") as HTMLInputElement).value = "";
                setSearch("");
            });
        });
    
        const fuse = new Fuse<SearchResult>(searchResults, {
            keys: ['ShortName'],
            shouldSort: true,
            threshold: 0.4,
        });
    
        const fuseSearched = fuse.search(searchTerm).map(({ item }) => item);
    
        // Categorize results
        const performers = fuseSearched.filter(sResult => sResult.TypeData.__typename === "Performer");
        const tags = fuseSearched.filter(sResult => sResult.TypeData.__typename === "Tag");
        const scenes = fuseSearched.filter(sResult => sResult.TypeData.__typename === "Scene");
        const studios = fuseSearched.filter(sResult => sResult.TypeData.__typename === "Studio");
        const galleries = fuseSearched.filter(sResult => sResult.TypeData.__typename === "Gallery");
    
        function goToFirstResult() {
            const firstResult = fuse.search(searchTerm)[0].item;
            history.push(`/${
                firstResult.TypeData.__typename === "Tag" ? "tags" :
                firstResult.TypeData.__typename === "Performer" ? "performers" :
                firstResult.TypeData.__typename === "Scene" ? "scenes" :
                firstResult.TypeData.__typename === "Studio" ? "studios" :
                firstResult.TypeData.__typename === "Gallery" ? "galleries" :
                ""
            }/${firstResult.TypeData.id}`);
        }
    
        return (
                <div className="search-results-grid">
                    {performers.length > 0 ? (
                        <div className="performers-category category">
                            <Link to="/performers" className="category-link">
                                <h5>Performers</h5>
                            </Link>
                            <div className="category-grid">
                                {performers.slice(0, 9).map(sResult => (
                                    <PerformerCard key={sResult.TypeData.id} performer={sResult.TypeData as GQL.PerformerDataFragment} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="performers-category category">
                            <Link to="/performers" className="category-link">
                                <h5>Performers</h5>
                            </Link>
                            <div className="no-results">No results found...</div>
                        </div>
                    )}
    
                    {galleries.length > 0 ? (
                        <div className="galleries-category category">
                            <Link to="/galleries" className="category-link">
                                <h5>Galleries</h5>
                            </Link>
                            <div className="category-grid">
                                {galleries.slice(0, 9).map(sResult => (
                                    <GalleryCard key={sResult.TypeData.id} gallery={sResult.TypeData as GQL.SlimGalleryDataFragment} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="galleries-category category">
                            <Link to="/galleries" className="category-link">
                                <h5>Galleries</h5>
                            </Link>
                            <div className="no-results">No results found...</div>
                        </div>
                    )}
    
                    {scenes.length > 0 ? (
                        <div className="scenes-category category">
                            <Link to="/scenes" className="category-link">
                                <h5>Scenes</h5>
                            </Link>
                            <div className="category-grid">
                                {scenes.slice(0, 9).map(sResult => (
                                    <SceneCard key={sResult.TypeData.id} scene={sResult.TypeData as GQL.SlimSceneDataFragment} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="scenes-category category">
                            <Link to="/scenes" className="category-link">
                                <h5>Scenes</h5>
                            </Link>
                            <div className="no-results">No results found...</div>
                        </div>
                    )}
    
                    {studios.length > 0 ? (
                        <div className="studios-category category">
                            <Link to="/studios" className="category-link">
                                <h5>Studios</h5>
                            </Link>
                            <div className="category-grid">
                                {studios.slice(0, 9).map(sResult => (
                                    <StudioCard key={sResult.TypeData.id} studio={sResult.TypeData as GQL.StudioDataFragment} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="studios-category category">
                            <Link to="/studios" className="category-link">
                                <h5>Studios</h5>
                            </Link>
                            <div className="no-results">No results found...</div>
                        </div>
                    )}
    
                    {tags.length > 0 ? (
                        <div className="tags-category category">
                            <Link to="/tags" className="category-link">
                                <h5>Tags</h5>
                            </Link>
                            <div className="category-grid">
                                {tags.slice(0, 9).map(sResult => (
                                    <TagCard key={sResult.TypeData.id} tag={sResult.TypeData as GQL.TagDataFragment}zoomIndex={4} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="tags-category category">
                            <Link to="/tags" className="category-link">
                                <h5>Tags</h5>
                            </Link>
                            <div className="no-results">No results found...</div>
                        </div>
                    )}
                </div>
            );
        }
    const SB = <div className="d-flex flex-row SearchBox">
        <FormControl
            ref={queryRef}
            id={"SearchBox"}
            placeholder={`Search`}
            autoComplete="off"
            defaultValue={""}
            onInput={onChangeQuery}
            className="query-text-field search-box-input bg-secondary text-white border-secondary mousetrap"
        />
        <Button
            variant="secondary"
            onClick={onClearQuery}
            className={`search-clear ${searchTerm != "" ? "" : "d-none"}`}
        >
            <Icon icon={faTimes} />
        </Button>
            <div className={`search-results ${searchTerm != "" ? "Searching" : "hide"}`}>
                {getSearchResults()}
            </div>
    </div>

    return SB
}