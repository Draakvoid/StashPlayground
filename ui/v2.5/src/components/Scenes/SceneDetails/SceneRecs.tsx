import React, { useState } from "react";
import * as GQL from "src/core/generated-graphql";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { objectTitle } from "src/core/files";
interface IProps {
    scene: GQL.SlimSceneDataFragment;
    queueObj: JSX.Element
}
interface SRQSProps {
    sceneRecs: GQL.SlimSceneDataFragment[]
}
export const SceneRecQueueStyle: React.FC<SRQSProps> =({
    sceneRecs
}) => {
    const thing = sceneRecs.map((scene) => (
        <>
            <li
            className="my-2"
            key={scene.id}
            >
                <Link
                to={`/scenes/${scene.id}`}
                >
                    <div className="ml-1 d-flex align-items-center">
                        <div className="thumbnail-container">
                        <img
                            loading="lazy"
                            alt={scene.title ?? ""}
                            src={scene.paths.screenshot ?? ""}
                        />
                        </div>
                        <div className="queue-scene-details">
                        <span className="queue-scene-title">{objectTitle(scene)}</span>
                        <span className="queue-scene-studio">{scene?.studio?.name}</span>
                        <span className="queue-scene-performers">
                            {scene?.performers
                            ?.map(function (performer) {
                                return performer.name;
                            })
                            .join(", ")}
                        </span>
                        <span className="queue-scene-date">{scene?.date}</span>
                        </div>
                    </div>
                </Link>
            </li>
        </>
    ))
    return (
        <div id="queue-viewer">
          <div id="queue-content">
            <ol start={1}>{thing}</ol>
          </div>
        </div>
      );
}
export const SceneRecs: React.FC<IProps> = ({
    scene,
    queueObj
}) => {
    const perfIds = scene.performers.map((performer) => performer.id)
    function getSameStudioPerf(id: string):GQL.SlimSceneDataFragment[] {
        const {data} = GQL.useFindScenesQuery({
            variables: {
                filter: {
                    sort: "random"
                },
                scene_filter: {
                    performers: {
                        value: [id],
                        modifier: GQL.CriterionModifier.Includes
                    },
                    studios: {
                        value: [scene.studio!.id],
                        modifier: GQL.CriterionModifier.Includes
                    }
                }
            }
        })
        return data?.findScenes?.scenes!
    }
    function getSameStudio(id: string):GQL.SlimSceneDataFragment[] {
        const {data} = GQL.useFindScenesQuery({
            variables: {
                filter: {
                    sort: "random"
                },
                scene_filter: {
                    studios: {
                        value: [scene.studio!.id],
                        modifier: GQL.CriterionModifier.Includes
                    }
                }
            }
        })
        return data?.findScenes?.scenes!
    }
    function getSamePerf (id: string) {
        const {data} = GQL.useFindScenesQuery({
            variables: {
                filter: {
                    sort: "random"
                },
                scene_filter: {
                    performers: {
                        value: [id],
                        modifier: GQL.CriterionModifier.Includes
                    }
                }
            }
        })
        return data?.findScenes?.scenes!
    }
    function removeDuplicates(scenes: GQL.SlimSceneDataFragment[]) {
        var uniqueNum:number[] = [];
        var uniqueScenes: GQL.SlimSceneDataFragment[] = [];
        for (var i = 0; i < scenes.length; i++) {
            if (uniqueNum.indexOf(Number(scenes[i].id)) === -1) {
                uniqueNum.push(Number(scenes[i].id));
                uniqueScenes.push(scenes[i])
            }
        }
        return uniqueScenes;
    }
    function hasStudioAndPerf() {
        const combined:GQL.SlimSceneDataFragment[] = []
        perfIds.map((id) => combined.push.apply(combined, getSameStudioPerf(id)))
        perfIds.map((id) => combined.push.apply(combined, getSamePerf(id)))
        perfIds.map((id) => combined.push.apply(combined, getSameStudio(id)))
        const uniqued = removeDuplicates(combined)
        const sceneIds = uniqued.map((item) => item.id)
        uniqued.splice(sceneIds.indexOf(scene.id), 1)
        const content = 
            <SceneRecQueueStyle
                key={Math.random()}
                sceneRecs={uniqued.slice(0, 10)}
                />
        return content
    }
    function hasPerf() {
        const combined:GQL.SlimSceneDataFragment[] = []
        const dummy:GQL.SlimSceneDataFragment[] = []
        perfIds.map((id) => combined.push.apply(combined, getSamePerf(id)))
        perfIds.map((id) => dummy.push.apply(dummy, getSamePerf(id))) // To prevent more/less hook error
        perfIds.map((id) => dummy.push.apply(dummy, getSamePerf(id))) // To prevent more/less hook error
        const uniqued = removeDuplicates(combined)
        const sceneIds = uniqued.map((item) => item.id)
        uniqued.splice(sceneIds.indexOf(scene.id), 1)
        const content = 
            <SceneRecQueueStyle 
                key={Math.random()}
                sceneRecs={uniqued.slice(0,10)}
                />
        return content
    }
    function hasStudio() {
        const combined:GQL.SlimSceneDataFragment[] = []
        const dummy:GQL.SlimSceneDataFragment[] = []
        perfIds.map((id) => combined.push.apply(combined, getSameStudio(id)))
        perfIds.map((id) => dummy.push.apply(dummy, getSamePerf(id))) // To prevent more/less hook error
        perfIds.map((id) => dummy.push.apply(dummy, getSamePerf(id))) // To prevent more/less hook error
        const uniqued = removeDuplicates(combined)
        const sceneIds = uniqued.map((item) => item.id)
        uniqued.splice(sceneIds.indexOf(scene.id), 1)
        const content = 
            <SceneRecQueueStyle 
                key={Math.random()}
                sceneRecs={uniqued.slice(0,10)}
                />
        return content
    }
    function isNotNull(value:any) {
        return value != ""
    }
    const [isAll, setIsAll] = useState(false)
    const [isPerformers, setIsPerformers] = useState(false)
    const [isStudio, setIsStudio] = useState(false)
    const [isQueue, setIsQueue] = useState(true)
    function render() {
        const performersFemale = scene.performers.map((performer) => performer.gender === "FEMALE" ? performer.name : "").filter(isNotNull) // this is for the performer tab, I only care about Female performers. todo make gender neutral
        const allContent = scene.performers.length != 0 && scene.studio ? hasStudioAndPerf() : undefined
        const performerContent = scene.performers.length > 0 ? hasPerf() : undefined
        const studioContent = scene.studio ? hasStudio() : undefined 
        var content = isAll ? allContent
                    : isPerformers ? performerContent
                    : isStudio ? studioContent
                    : isQueue ? queueObj
                    : undefined
        const display = 
        <>
            <div className="d-flex flex-row justify-content-between">
                <h5>Resume Filter</h5>
                <h5>Similiar Content</h5>
            </div>
            <div className="d-flex flex-row">
                <Button 
                className={`${isQueue ? "" : "btn-secondary"} mr-2`}
                onClick={() => {
                    setIsStudio(false)
                    setIsAll(false)
                    setIsPerformers(false)
                    setIsQueue(true)
                }}
                >
                    Queue
                </Button>
                <div className="flex-grow-1"></div>
                {performersFemale.length != 0 && scene.studio ?
                    <Button 
                    className={`${isAll ? "" : "btn-secondary"} mr-2`}
                    onClick={() => {
                        setIsStudio(false)
                        setIsAll(true)
                        setIsPerformers(false)
                        setIsQueue(false)
                    }}
                    >
                    All
                    </Button>
                    : ""
                }
                {scene.performers.length != 0 ? 
                    <Button 
                    className={`${isPerformers ? "" : "btn-secondary"} mr-2`}
                    onClick={() => {
                        setIsStudio(false)
                        setIsAll(false)
                        setIsPerformers(true)
                        setIsQueue(false)
                    }}
                    >
                    {performersFemale.length > 1 ? "Performers" : performersFemale[0] // sets the performers tab to a performer name if only one female on scene, Performers otherwise
                    } 
                    </Button>
                    : ""
                }
                {scene.studio ? 
                    <Button 
                    className={`${isStudio ? "" : "btn-secondary"}`}
                    onClick={() => {
                        setIsStudio(true)
                        setIsAll(false)
                        setIsPerformers(false)
                        setIsQueue(false)
                    }}
                    >
                    {scene.studio!.name}
                    </Button>
                    : ""
                }   
            </div>
            {content}
        </>
        return display
    }
    
    
    return render()
}