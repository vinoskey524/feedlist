/*
*
* FeedList
*
* ...
*
* @vinoskey524 • Hamet Kévin E. ODOUTAN (Author)
*
*/

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, memo, JSX } from 'react';
import './main.css';
import $ from 'jquery';
import forestDB from 'forestdb';
import type { FOREST_DB_TYPE } from './forestTypes';

/* Init global forest */
const globalForest = forestDB.init({ mainKey: 'id', dateFormat: ['YYYY_MM_DD', 'MM_DD_YYYY'] });

/* ----------------------------------------- Types ----------------------------------------- */

type LIST_MODE_TYPE = 'default' | 'gallery';

type FEED_LIST_PROPS_TYPE<T extends LIST_MODE_TYPE> = T extends 'default' ? {
    /** List ID • Must be immutable during all the lifetime of the component */
    id: string,

    /** "feeds" | "gallery" */
    mode: T,

    /** Primary Key */
    primaryKey: string,

    /** Feeds */
    feeds: JSON_DEFAULT_TYPE[],

    /** First batch */
    firstBatch?: FL_FIRST_BATCH_TYPE,

    /** - */
    // batchCycle?: FL_BATCH_CYCLE_TYPE,

    /** Number of columns */
    columns?: FL_COLUMNS_TYPE,

    /** Component */
    component: (...x: FL_CREATE_COMPONENT_PROP_ARG_TYPE) => JSX.Element,

    /** - */
    onFetch?: (...x: FL_ON_FETCH_ARG_TYPE) => JSON_DEFAULT_TYPE[] | undefined,

    /** On refresh */
    onRefresh?: () => void,

    /** On visible */
    onVisible?: (...x: FL_ON_VISIBLE_ARG_TYPE) => void,

    /** - */
    onListEndClose?: () => void,

    /** - */
    onListEndReached?: () => void,

    /** - */
    onError?: (...x: FL_ON_ERROR_ARG_TYPE) => void

} : {
    /** List ID • Must be immutable during all the lifetime of the component */
    id: string,

    /** "feeds" | "gallery" */
    mode: T,

    /** Primary Key */
    primaryKey: string,

    /** Feeds */
    feeds: JSON_DEFAULT_TYPE[],

    /** Number of columns */
    columns?: FL_COLUMNS_TYPE,

    /** Component */
    component: (...x: FL_CREATE_COMPONENT_PROP_ARG_TYPE) => JSX.Element,

    /** - */
    onFetch?: (...x: FL_ON_FETCH_ARG_TYPE) => FL_ON_FETCH_RETURN_TYPE,

    /** On refresh */
    onRefresh?: () => void,

    /** On visible */
    onVisible?: (...x: FL_ON_VISIBLE_ARG_TYPE) => void,

    /** When the list end is close to be reached and there's no more feed to render */
    onListEndClose?: () => void,

    /** When the list end is fully reached */
    onListEndReached?: () => void,

    /** - */
    onError?: (...x: FL_ON_ERROR_ARG_TYPE) => void
};
type FL_BATCH_CYCLE_TYPE = 'infinite' | number;
type FL_COLUMNS_TYPE = 'adaptative' | number;

type FL_ON_VISIBLE_ARG_TYPE = [id: string, isVisible: boolean, rect: DOMRectReadOnly];

type FL_ON_FETCH_ARG_TYPE = [idealFeedCount: number];
type FL_ON_FETCH_RETURN_TYPE = JSON_DEFAULT_TYPE[] | undefined;

type FL_ON_ERROR_ARG_TYPE = [source: FL_ON_ERROR_SOURCE_TYPE, message: string];
type FL_ON_ERROR_SOURCE_TYPE = 'onRefresh' | 'onVisible' | 'onFetch' | 'onListEndClose' | 'onListEndReached';

/* External APIs */
export type FL_METHODS_TYPE = {
    renderFeeds: <T extends FL_FEED_RENDERING_POSITION>(x: FL_RENDER_FEEDS_ARG_TYPE<T>) => FUNCTION_DEFAULT_RETURN_TYPE,
    updateFeeds: (x: FL_UPDATE_FEEDS_ARG_TYPE) => FUNCTION_DEFAULT_RETURN_TYPE,
    removeFeeds: (x: FL_REMOVE_FEEDS_ARG_TYPE) => FUNCTION_DEFAULT_RETURN_TYPE,
    restoreFeeds: (x: FL_REMOVE_FEEDS_ARG_TYPE) => FUNCTION_DEFAULT_RETURN_TYPE,
    getVisibleFeeds: <T extends boolean>() => GET_VISIBLE_FEED_RETURN_TYPE<T>,
    scrollToTop: () => void,
    fetchFeeds: () => Promise<FUNCTION_DEFAULT_RETURN_TYPE>
};
export type FL_ERROR_SOURCE_TYPE = FL_ON_ERROR_SOURCE_TYPE;

type FL_FEED_RENDERING_POSITION = 'before' | 'after' | 'top' | 'bottom';

type FL_RENDER_FEEDS_ARG_TYPE<T extends FL_FEED_RENDERING_POSITION> =
    T extends 'before' ? { position: T, targetId: string, feeds: JSON_DEFAULT_TYPE[] } :
    T extends 'after' ? { position: T, targetId: string, feeds: JSON_DEFAULT_TYPE[] } :
    T extends 'top' ? { position: T, feeds: JSON_DEFAULT_TYPE[] } :
    T extends 'bottom' ? { position: T, feeds: JSON_DEFAULT_TYPE[] } : any;
type FL_UPDATE_FEEDS_ARG_TYPE = { feeds: JSON_DEFAULT_TYPE[] };
type FL_REMOVE_FEEDS_ARG_TYPE = { feedsId: string | string[] };
type FL_RESTORE_FEEDS_ARG_TYPE = { feedsId: string | string[] };

type FL_INTERNAL_METHODS_TYPE = {
    scaffoldId: string,
    primaryKey: string,
    firstBatch: number,
    feedCountPerBatch: React.RefObject<number>,
    mode: LIST_MODE_TYPE,
    columns: FL_COLUMNS_TYPE,
    forest: FOREST_DB_TYPE,
    forestName: string,
    branchName: string,

    createFeedComponent: (...x: FL_CREATE_COMPONENT_PROP_ARG_TYPE) => JSX.Element,
    updateFirstLastFeedContainerRef: (x: FL_UPDATE_FIRST_LAST_FC_REF_TYPE) => void,
    triggerOnFetch: (...x: FL_ON_FETCH_ARG_TYPE) => FL_ON_FETCH_RETURN_TYPE,
    triggerOnRefresh: () => void,
    triggerOnVisible: (...x: FL_ON_VISIBLE_ARG_TYPE) => void,
    triggerOnListEndClose: () => void,
    triggerOnListEndReached: () => void
};
type FL_CREATE_COMPONENT_PROP_ARG_TYPE = [data: any, key: string];
type FL_UPDATE_FIRST_LAST_FC_REF_TYPE = { type: 'first' | 'last', currentRef: REF_UNDEFINED_TYPE };

type FL_FIRST_BATCH_TYPE = '05' | '10' | '20' | '30' | '40' | '50' | '60' | '70' | '80' | '90';

type FL_GET_SIBLING_ARG_TYPE = { currentFeedId: string, siblingIndex?: number };
type FL_GET_SIBLING_RETURN_TYPE = string | null;

type FL_CALLBACKS_NAME_TYPE = 'onRefresh' | 'onFetch' | 'onListEndClose' | 'onListEndReached' | 'onError';
type FL_MAP_TYPE = {
    [scaffoldId: string]: {
        [feedID: string]: {
            id: string,
            data: JSON_DEFAULT_TYPE,
            wrapperRef: React.RefObject<FW_INTERNAL_METHODS_TYPE | undefined>,
            topSubContainerRef: React.RefObject<FSC_INTERNAL_METHODS_TYPE | undefined>,
            bottomSubContainerRef: React.RefObject<FSC_INTERNAL_METHODS_TYPE | undefined>
        }
    }
};
type FL_VISIBLE_FEEDS_ID_DATA_TYPE = {
    [scaffoldId: string]: {
        [key: string]: {
            wrapperId: string,
            feedId: string
        }
    }
}

type FL_CONTROLLER_REF = { current: FL_INTERNAL_METHODS_TYPE };


type FEED_CONTAINER_PROPS_TYPE = {
    wid?: string,
    controllerRef: FL_CONTROLLER_REF,
    sensorRef?: SENSOR_REF_TYPE,
    feeds?: JSON_DEFAULT_TYPE[],
    firstOrLast?: 'first' | 'last',
    isMainFeedContainer?: boolean
};
type FC_INTERNAL_METHODS_TYPE = {
    renderFeeds: (x: FC_RENDER_FEED_ARG_TYPE) => FUNCTION_DEFAULT_RETURN_TYPE
};
type FC_RENDER_FEED_ARG_TYPE = { position: 'top' | 'middle' | 'bottom', feeds: JSON_DEFAULT_TYPE[] };


type FEED_SUB_CONTAINER_PROPS_TYPE = {
    wid?: string,
    type: FSC_TYPE_TYPE,
    controllerRef: FL_CONTROLLER_REF,
    sensorRef?: SENSOR_REF_TYPE,
    renderingMode?: RENDERING_MODE_TYPE
};
type FSC_TYPE_TYPE = 'top' | 'middle' | 'bottom';
type FSC_INTERNAL_METHODS_TYPE = {
    renderSpace: () => FUNCTION_DEFAULT_RETURN_TYPE,
    renderFeeds: (x: FSC_RENDER_FEED_ARG_TYPE) => FUNCTION_DEFAULT_RETURN_TYPE,
    renderContainer: (x: FSC_RENDER_CONTAINER_ARG_TYPE) => FUNCTION_DEFAULT_RETURN_TYPE,
};
type FSC_RENDER_FEED_ARG_TYPE = { feeds: JSON_DEFAULT_TYPE[] };
type FSC_RENDER_CONTAINER_ARG_TYPE = { firstOrLast: 'first' | 'last' | undefined, feeds: JSON_DEFAULT_TYPE[] };


type FEED_WRAPPER_PROPS_ARG_TYPE = { wid?: string, controllerRef: FL_CONTROLLER_REF, component: any, feedData: JSON_DEFAULT_TYPE };
type FW_INTERNAL_METHODS_TYPE = {
    updateFeed: (x: FW_UPDATE_FEED_ARG_TYPE) => FUNCTION_DEFAULT_RETURN_TYPE,
    removeFeed: () => FUNCTION_DEFAULT_RETURN_TYPE,
    restoreFeed: () => FUNCTION_DEFAULT_RETURN_TYPE
};
type FW_UPDATE_FEED_ARG_TYPE = { newData: JSON_DEFAULT_TYPE };


type SENSOR_PROPS_TYPE = {
    wid?: string,
    feeds: JSON_DEFAULT_TYPE[],
    controllerRef: FL_CONTROLLER_REF,
    subContainerBottomRef: React.RefObject<FSC_INTERNAL_METHODS_TYPE | undefined>,
    isMainSensor: boolean
};
type SENSOR_DATA_TYPE = {
    [scaffoldId: string]: {
        [sensorId: string]: {
            id: string,
            topSubContainerRef: React.RefObject<FSC_INTERNAL_METHODS_TYPE | undefined>,
            bottomSubContainerRef: React.RefObject<FSC_INTERNAL_METHODS_TYPE | undefined>
        }
    }
};
type SENSOR_INTERNAL_METHODS_TYPE = {
    setBottomSubContainerRef: (x: SENSOR_SET_BOTTOM_SC_REF_ARG_TYPE) => void,
};
type SENSOR_REF_TYPE = React.RefObject<SENSOR_INTERNAL_METHODS_TYPE | undefined>;
type SENSOR_SET_BOTTOM_SC_REF_ARG_TYPE = { ref: React.RefObject<FSC_INTERNAL_METHODS_TYPE> };

type GET_VISIBLE_FEED_RETURN_TYPE<T extends boolean> = T extends true ? { ok: T, log: string, data: { id: string, index: number }[] }
    : { ok: T, log: string, data: any };


type RENDERING_MODE_TYPE = 'space' | 'feeds' | 'container';

type UPDATE_RENDERING_MODE_ARG_TYPE<T extends RENDERING_MODE_TYPE> = T extends 'feeds' ? { mode: T, feeds: any[] } : { mode: T };

type WATCH_SENSOR_CALLBACK_ARG_TYPE = { rect: DOMRectReadOnly, visible: boolean };


type JSON_DEFAULT_TYPE = { [key: string]: any };

type FUNCTION_DEFAULT_RETURN_TYPE = { ok: boolean, log: string, data: any };

type REF_UNDEFINED_TYPE = React.RefObject<undefined>;

type REF_NULL_TYPE = React.RefObject<null>;

type REF_ANY_TYPE = React.RefObject<any>;

/*
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
*/

/* ----------------------------------------- DATA Logistic ----------------------------------------- */

/** - */
const feedMapDATA: { current: FL_MAP_TYPE } = { current: {} };

/** Visible feeds Id */
const visibleFeedsIdDATA: { current: FL_VISIBLE_FEEDS_ID_DATA_TYPE } = { current: {} };

/** Sensor DATA */
const sensorDATA: { current: SENSOR_DATA_TYPE } = { current: {} };

/*
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
*/

/* ----------------------------------------- Methods ----------------------------------------- */

/** Log */
const _dev_ = true;
const logFunc = (...log: any[]) => { if (_dev_) console.log(...log) };

/** Id generator */
const generateIdFunc = (): string => {
    let id = '';
    const val = '0aW9zXe8CrVt1By5NuA46iZ3oEpRmTlYkUjIhOgPfMdQsSqDwFxGcHvJbKnL';
    for (var i = 0; i < 14; i++) id += val.charAt(Math.floor(Math.random() * 36));
    return id;
};

/** Delay function execution */
const delayFunc = (): Promise<void> => { return new Promise(resolve => setTimeout(resolve, 1)) };

/** Generate refs */
const generateRefsFunc = (x: { count: number }): REF_ANY_TYPE[] => Array(x.count || 1).fill(undefined).map(() => React.createRef());

/** Get number in the middle */
const getMiddleNumberFunc = (a: number, b: number) => { return (a + b) / 2 };

/** Observe feed */
const observeFeedFunc = (x: { wrapperId: string, callback: Function }) => {
    const el = document.getElementById(x.wrapperId);
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
        const entry = entries[0];
        const rect = entry.boundingClientRect;
        const visible = entry.isIntersecting;
        x.callback({ rect: rect, visible: visible });
    }, { root: null, threshold: 0.01 });
    obs.observe(el);
};

/*
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
*/

/* ----------------------------------------- FeedList • Component (main) ----------------------------------------- */

const FeedListWidget = forwardRef(<T extends LIST_MODE_TYPE>(props: FEED_LIST_PROPS_TYPE<T>, ref: any) => {
    /* -------------------------- Constants -------------------------- */

    const refresher = useRef(false);
    const [refresh, setRefresh] = useState(refresher.current);

    const isMounted = useRef(false);
    const render = useRef(false);

    const wid = useRef(props.id || generateIdFunc()).current;
    const mode = props.mode;
    const primaryKey = props.primaryKey;
    const feeds = useRef<JSON_DEFAULT_TYPE[]>(props.feeds || []);
    const firstBatch = parseInt((props as any).firstBatch) || 20;
    const columns = props.columns || 1;
    const createFeedComponentFunc = props.component;
    const onRefresh = props.onRefresh || undefined;
    const onFetch = props.onFetch || undefined;
    const onVisible = props.onVisible || undefined;
    const onListEndClose = props.onListEndClose || undefined;
    const onListEndReached = props.onListEndReached || undefined;
    const onError = props.onError || undefined;

    const mainFeedContainerRef = useRef<FC_INTERNAL_METHODS_TYPE>(undefined);

    const scaffoldId = useRef(generateIdFunc()).current;
    const scaffoldEl = useRef<JQuery<HTMLElement>>(null);

    const firstFeedContainerRef = useRef<FC_INTERNAL_METHODS_TYPE>(undefined);
    const lastFeedContainerRef = useRef<FC_INTERNAL_METHODS_TYPE>(undefined);

    const idealFeedCount = useRef(60);
    const feedCountPerBatch = useRef(firstBatch);

    /* Init "forestDB" */
    const forest = useRef(forestDB.init({ mainKey: primaryKey, dateFormat: ['YYYY_MM_DD', 'MM_DD_YYYY'] })).current;
    const forestName = useRef(generateIdFunc()).current;
    const branchName = 'feeds';


    /* -------------------------- Methods -------------------------- */

    /* Refresh component */
    const refreshFunc = () => { refresher.current = !refresher.current; setRefresh(refresher.current) };

    /* On mount */
    const onMountFunc = () => {
        if (isMounted.current) return;
        isMounted.current = true;

        /* - */
        feedMapDATA.current[scaffoldId] = {};
        visibleFeedsIdDATA.current[scaffoldId] = {};

        /* - */
        onPullToRefreshFunc();

        /* Render main FeedContainer */
        render.current = true;
        refreshFunc();

        /* On resize */
        window.onresize = () => { };

        /* clean up */
        return () => onUnmountFunc();
    };

    /* On unmount */
    const onUnmountFunc = () => { };

    /* Update "first/last" feed container ref */
    const updateFirstLastFeedContainerRefFunc = (x: FL_UPDATE_FIRST_LAST_FC_REF_TYPE) => {
        switch (x.type) {
            case 'first': { firstFeedContainerRef.current = x.currentRef.current } break;
            case 'last': { lastFeedContainerRef.current = x.currentRef.current } break;
            default: { };
        };
    };

    /* Check feeds */
    const checkFeedsFunc = (feeds: JSON_DEFAULT_TYPE[]) => {
        if (!Array.isArray(feeds)) throw new Error(`"feeds" is not an array.`);

        /* - */
    };

    /* On pull to refresh */
    const onPullToRefreshFunc = () => {
        const container = document.getElementById(`${scaffoldId}`)!;
        const icon = document.getElementById('pull-icon')!;
        const circle = document.getElementById('progress-circle')! as unknown as SVGCircleElement;

        let startY = 0;
        let pulling = false;
        let loading = false;

        const circumference = 2 * Math.PI * 20; // r = 20
        circle.style.strokeDasharray = `${circumference}`;
        circle.style.strokeDashoffset = `${circumference}`;

        container.addEventListener('pointerdown', e => {
            if (container.scrollTop === 0 && !loading) {
                startY = e.clientY;
                pulling = true;
            }
        });

        container.addEventListener('pointermove', e => {
            if (!pulling || loading) return;

            const distance = e.clientY - startY;
            if (distance > 0) {
                icon.classList.add('visible');

                const pullDistance = distance < 100
                    ? distance
                    : 100 + Math.log(distance - 99) * 20;

                // Move icon with pull
                icon.style.transform = `translate(-50%, ${pullDistance}px)`;

                // Update progress stroke (0 → 100%)
                const progress = Math.min(pullDistance / 80, 1);
                circle.style.strokeDashoffset = `${circumference * (1 - progress)}`;
            }
        });

        container.addEventListener('pointerup', () => {
            if (!pulling || loading) return;
            pulling = false;

            const pulledEnough = getTranslateY(icon) > 50;

            if (pulledEnough) {
                startRefresh();
            } else {
                bounceBack();
            }
        });

        function startRefresh() {
            loading = true;
            icon.style.transform = `translate(-50%, 0)`;
            icon.classList.add('spin');

            console.log('Refreshing...');
            setTimeout(() => {
                console.log('Done refresh');
                loading = false;
                bounceBack();
            }, 1500);
        }

        function bounceBack() {
            icon.style.transition = 'transform 0.5s cubic-bezier(0.22, 1.61, 0.36, 1)';
            icon.style.transform = `translate(-50%, -100%)`;
            setTimeout(() => {
                icon.style.transition = '';
                icon.classList.remove('visible', 'spin');
                circle.style.strokeDashoffset = `${circumference}`; // reset progress
            }, 500);
        }

        function getTranslateY(el: HTMLElement) {
            const match = el.style.transform.match(/,\s*([-\d.]+)px/);
            return match ? parseFloat(match[1]) : 0;
        }
    };


    /* Trigger callbacks */

    /* Trigger "onFetch" */
    const triggerOnFetchFunc = async (): Promise<FUNCTION_DEFAULT_RETURN_TYPE> => {
        let res: FUNCTION_DEFAULT_RETURN_TYPE = { ok: true, log: '', data: undefined };
        if (typeof onFetch !== 'function') {
            res.ok = false; res.log = `No 'onFetch' method provided !`;
            return res;
        };
        try {
            const newFeeds = await onFetch(idealFeedCount.current);
            res.data = newFeeds || [];

        } catch (e: any) {
            res.ok = false; res.log = e.message;
            delayFunc().then(() => { triggerOnErrorFunc({ source: 'onFetch', message: e.message }) });
        }
        return res;
    };

    /* Trigger "onRefresh" */
    const triggerOnRefreshFunc = async () => {
        if (typeof onRefresh !== 'function') return;
        try { await onRefresh() } catch (e: any) { triggerOnErrorFunc({ source: 'onRefresh', message: e.message }) }
    };

    /* Trigger "onVisible" */
    const triggerOnVisibleFunc = async (...x: FL_ON_VISIBLE_ARG_TYPE) => {
        if (typeof onVisible !== 'function') return;
        try { await onVisible(...x) } catch (e: any) { triggerOnErrorFunc({ source: 'onVisible', message: e.message }) }
    };

    /* Trigger "onListEndClose" */
    const triggerOnListEndCloseFunc = async (x: any) => {
        if (typeof onListEndClose !== 'function') return;
        try { await onListEndClose() } catch (e: any) { triggerOnErrorFunc({ source: 'onListEndClose', message: e.message }) }
    };

    /* Trigger "onListEndReached" */
    const triggerOnListEndReachedFunc = async () => {
        if (typeof onListEndReached !== 'function') return;
        try { await onListEndReached() } catch (e: any) { triggerOnErrorFunc({ source: 'onListEndReached', message: e.message }) }
    };

    /* Trigger "onError" */
    const triggerOnErrorFunc = (x: { source: FL_ON_ERROR_SOURCE_TYPE, message: string }) => {
        if (typeof onError !== 'function') return;
        try { onError(x.source, x.message) } catch (e: any) { console.log(`Err :: onError() =>`, e.message) }
    };



    /* External APIs */

    /* Fetch feeds */
    const fetchFeedsFunc = async (): Promise<FUNCTION_DEFAULT_RETURN_TYPE> => {
        let res: FUNCTION_DEFAULT_RETURN_TYPE = { ok: true, log: '', data: undefined };
        try { res = await triggerOnFetchFunc() }
        catch (e: any) { res.ok = false; res.log = e.message }
        return res;
    };

    /* Render feeds */
    const renderFeedsFunc = <T extends FL_FEED_RENDERING_POSITION>(x: FL_RENDER_FEEDS_ARG_TYPE<T>): FUNCTION_DEFAULT_RETURN_TYPE => {
        let res: FUNCTION_DEFAULT_RETURN_TYPE = { ok: true, log: '', data: undefined };
        try {
            const position = x.position;
            const targetId = (x as any).targetId;
            const feedsTab = x.feeds;
            checkFeedsFunc(feedsTab);

            /* - */
            if (feedsTab.length === 0) throw new Error(`The list is empty !`);

            /* - */
            const noTargetFoundError = `Target "${targetId}" not found.`;
            const unexpectedError = `An unexpected error occured. Impossible to render feeds.`;

            /* - */
            switch (position) {
                case 'before': {
                    triggerOnFetchFunc();
                    const wrapperRef = feedMapDATA.current[scaffoldId][targetId]?.wrapperRef || undefined;
                    if (!wrapperRef || !wrapperRef.current) throw new Error(noTargetFoundError);

                    const topSubContainerRef = feedMapDATA.current[scaffoldId][targetId]?.topSubContainerRef || undefined;
                    if (!topSubContainerRef || !topSubContainerRef.current) throw new Error(unexpectedError);

                    topSubContainerRef.current.renderContainer({ feeds: feedsTab, firstOrLast: undefined });
                } break;

                case 'after': {
                    const wrapperRef = feedMapDATA.current[scaffoldId][targetId]?.wrapperRef || undefined;
                    if (!wrapperRef || !wrapperRef.current) throw new Error(noTargetFoundError);

                    const bottomSubContainerRef = feedMapDATA.current[scaffoldId][targetId]?.bottomSubContainerRef || undefined;
                    if (!bottomSubContainerRef || !bottomSubContainerRef.current) throw new Error(unexpectedError);

                    bottomSubContainerRef.current.renderContainer({ feeds: feedsTab, firstOrLast: undefined });
                } break;

                case 'top': { } break;

                case 'bottom': { } break;

                default: { };
            };

        } catch (e: any) { res.ok = false; res.log = e.message }
        return res;
    };

    /* Update feeds */
    const updateFeedsFunc = (x: FL_UPDATE_FEEDS_ARG_TYPE): FUNCTION_DEFAULT_RETURN_TYPE => {
        let res: FUNCTION_DEFAULT_RETURN_TYPE = { ok: true, log: '', data: undefined };
        try {
            const feedsData = x.feeds;
            checkFeedsFunc(feedsData);
            const flen = feedsData.length;
            for (let i = 0; i < flen; i++) {
                const currentFeedData = feedsData[i];
                const fid = currentFeedData[primaryKey];
                const wrapperRef = feedMapDATA.current[scaffoldId][fid].wrapperRef || undefined;
                if (!wrapperRef) continue;
                wrapperRef.current?.updateFeed({ newData: currentFeedData });
            }

        } catch (e: any) { res.ok = false; res.log = e.message }
        return res;
    };

    /* Remove feeds */
    const removeFeedsFunc = (x: FL_REMOVE_FEEDS_ARG_TYPE): FUNCTION_DEFAULT_RETURN_TYPE => {
        let res: FUNCTION_DEFAULT_RETURN_TYPE = { ok: true, log: '', data: undefined };
        try {
            const feedsId = Array.isArray(x.feedsId) ? x.feedsId : [x.feedsId];
            const flen = feedsId.length;
            for (let i = 0; i < flen; i++) {
                const fid = feedsId[i];
                const wrapperRef = feedMapDATA.current[scaffoldId][fid].wrapperRef || undefined;
                if (!wrapperRef) continue;
                wrapperRef.current?.removeFeed();
            }

        } catch (e: any) { res.ok = false; res.log = e.message }
        return res;
    };

    /* Restore feeds */
    const restoreFeedsFunc = (x: FL_RESTORE_FEEDS_ARG_TYPE): FUNCTION_DEFAULT_RETURN_TYPE => {
        let res: FUNCTION_DEFAULT_RETURN_TYPE = { ok: true, log: '', data: undefined };
        try {
            const feedsId = Array.isArray(x.feedsId) ? x.feedsId : [x.feedsId];
            const flen = feedsId.length;
            for (let i = 0; i < flen; i++) {
                const fid = feedsId[i];
                const wrapperRef = feedMapDATA.current[scaffoldId][fid].wrapperRef || undefined;
                if (!wrapperRef) continue;
                wrapperRef.current?.restoreFeed();
            }

        } catch (e: any) { res.ok = false; res.log = e.message }
        return res;
    };

    /* Get visible feeds */
    const getVisibleFeedsFunc = <T extends boolean>(): GET_VISIBLE_FEED_RETURN_TYPE<T> => {
        let res: any = { ok: true, log: '', data: undefined };
        try {
            const tab = Object.values(visibleFeedsIdDATA.current[scaffoldId]);

            /* - */
            let arr: { id: string, index: number, x: number, y: number }[] = [];
            for (let i = 0; i < tab.length; i++) {
                const target = tab[i];
                const fid = target.feedId;
                const wid = target.wrapperId;
                const el = document.getElementById(wid);
                if (!el) continue;
                const rect = el.getBoundingClientRect();
                arr.push({ id: fid, index: 0, x: rect.x, y: rect.y });
            }

            /* Sort */
            if (columns === 'adaptative' || columns > 1) {
                /* extract all "y" */
                let ytab: number[] = [];
                for (let h = 0; h < arr.length; h++) {
                    const cy = arr[h].y;
                    if (!ytab.includes(cy)) ytab.push(cy);
                }
                ytab.sort((a, b) => a - b);

                /* - */
                const tab = [];
                for (let n = 0; n < ytab.length; n++) {
                    const cy = ytab[n];
                    const filter = arr.filter((e) => e.y === cy);
                    filter.sort((a, b) => a.x - b.x);
                    tab.push(...filter);
                }
                arr = tab;
            }
            else arr.sort((a, b) => a.y - b.y);

            /* Add index */
            for (let n = 0; n < arr.length; n++) {
                arr[n].index = n;
                delete (arr[n] as any).x;
                delete (arr[n] as any).y;
            }

            /* Set data */
            res.data = arr;

        } catch (e: any) { res.ok = false; res.log = e.message }
        return res;
    };

    /* Scroll to top */
    const scrollToTopFunc = () => { scaffoldEl.current?.scrollTop(0) };

    /* Get next sibling */
    const getNextSiblingFunc = (x: FL_GET_SIBLING_ARG_TYPE): FL_GET_SIBLING_RETURN_TYPE => {
        let siblingId = null;

        const currentFeedId = x.currentFeedId;
        const siblingIndex = x.siblingIndex || 0;

        return siblingId;
    };

    /* Get prev sibling */
    const getPrevSiblingFunc = (x: FL_GET_SIBLING_ARG_TYPE): FL_GET_SIBLING_RETURN_TYPE => {
        let siblingId = null;

        const currentFeedId = x.currentFeedId;
        const siblingIndex = x.siblingIndex || 0;

        return siblingId;
    };


    /* -------------------------- Imperative Handle & Effects -------------------------- */

    /* Imperative Handle */
    useImperativeHandle(ref, () => ({
        /* Constants */
        scaffoldId: scaffoldId,
        primaryKey: primaryKey,
        firstBatch: firstBatch,
        feedCountPerBatch: feedCountPerBatch,
        mode: mode,
        columns: columns,
        forest: forest,
        forestName: forestName,
        branchName: branchName,

        /* Methods */
        renderFeeds: renderFeedsFunc,
        updateFeeds: updateFeedsFunc,
        removeFeeds: removeFeedsFunc,
        restoreFeeds: restoreFeedsFunc,
        getVisibleFeeds: getVisibleFeedsFunc,
        scrollToTop: scrollToTopFunc,
        fetchFeeds: fetchFeedsFunc,
        /* - */
        createFeedComponent: createFeedComponentFunc,
        updateFirstLastFeedContainerRef: updateFirstLastFeedContainerRefFunc,
        /* _ */
        triggerOnFetch: triggerOnFetchFunc,
        triggerOnRefresh: triggerOnRefreshFunc,
        triggerOnVisible: triggerOnVisibleFunc,
        triggerOnListEndClose: triggerOnListEndCloseFunc,
        triggerOnListEndReached: triggerOnListEndReachedFunc
    }), []);

    /* On mount */
    useEffect(onMountFunc, []);


    /* -------------------------- Component -------------------------- */

    const component = <>
        <div id={scaffoldId} className={`rel overflow_y ${(columns === 'adaptative' || columns > 1) ? 'flex_wrap' : ''}`} style={{ width: '100%', height: '100%', scrollBehavior: 'smooth' }}>
            <div id='pull-icon'>
                <svg viewBox='0 0 50 50' width='32' height='32'>
                    <circle
                        id='progress-circle'
                        cx='25'
                        cy='25'
                        r='20'
                        fill='none'
                        stroke='#4cafef'
                        strokeWidth='4'
                        strokeLinecap='round'
                        strokeDasharray='125.6' /* circumference = 2πr */
                        strokeDashoffset='125.6'
                    />
                </svg>
            </div>

            {render.current && <FeedContainer ref={mainFeedContainerRef} feeds={feeds.current} controllerRef={ref} isMainFeedContainer={true} />}
            <img src='./loading.gif' width={50} height={50} />
        </div>
    </>;
    return (component);
});
export const FeedList = memo(FeedListWidget, () => true);

/*
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
*/

/* ----------------------------------------- FeedContainer • Component ----------------------------------------- */

const FeedContainer = forwardRef((props: FEED_CONTAINER_PROPS_TYPE, ref: any) => {
    /* -------------------------- Constants -------------------------- */

    const refresher = useRef(false);
    const [refresh, setRefresh] = useState(refresher.current);

    const isMounted = useRef(false);
    const render = useRef(true);

    const wid = useRef(props.wid || generateIdFunc()).current;
    const controllerRef = props.controllerRef;
    const feeds = props.feeds || [];
    const firstOrLast = props.firstOrLast || undefined;
    const isMainFeedContainer = props.isMainFeedContainer || false;
    const sensorRef = props.sensorRef || useRef<SENSOR_INTERNAL_METHODS_TYPE>(undefined);

    const subContainerTopRef = useRef<FSC_INTERNAL_METHODS_TYPE>(undefined);
    const subContainerMiddleRef = useRef<FSC_INTERNAL_METHODS_TYPE>(undefined);
    const subContainerBottomRef = useRef<FSC_INTERNAL_METHODS_TYPE>(undefined);

    const scaffoldId = controllerRef.current.scaffoldId;

    /* forest */
    const forest = controllerRef.current.forest;
    const forestName = controllerRef.current.forestName;
    const branchName = controllerRef.current.branchName;


    /* -------------------------- Methods -------------------------- */

    /* Refresh component */
    const refreshFunc = () => { refresher.current = !refresher.current; setRefresh(refresher.current) };

    /* On mount */
    const onMountFunc = () => {
        if (isMounted.current) return;
        isMounted.current = true;

        /* - */
        if (!isMainFeedContainer && feeds.length > 0) renderFeedsFunc({ position: 'middle', feeds: feeds });

        /* - */
        // if (firstOrLast) controllerRef.current.updateFirstLastFeedContainerRef({ type: firstOrLast, currentRef: ref });

        /* clean up */
        return () => onUnmountFunc();
    };

    /* On unmount */
    const onUnmountFunc = () => { };



    /* APIs */

    /* Render feeds */
    const renderFeedsFunc = (x: FC_RENDER_FEED_ARG_TYPE): FUNCTION_DEFAULT_RETURN_TYPE => {
        let res = { ok: true, log: '', data: undefined };
        try {
            const position = x.position;
            const feeds = x.feeds;
            switch (position) {
                case 'top': {
                    const rd = subContainerTopRef.current!.renderContainer({ firstOrLast: 'first', feeds: feeds });
                    if (!rd.ok) throw new Error(rd.log);
                } break;

                case 'middle': {
                    const rd = subContainerMiddleRef.current!.renderFeeds({ feeds: feeds });
                    if (!rd.ok) throw new Error(rd.log);
                } break;

                case 'bottom': {
                    const rd = subContainerBottomRef.current!.renderContainer({ firstOrLast: 'last', feeds: feeds });
                    if (!rd.ok) throw new Error(rd.log);
                } break;

                default: { };
            };

        } catch (e: any) { res.ok = false; res.log = e.message }
        return res;
    };


    /* -------------------------- Imperative Handle & Effects -------------------------- */

    /* Imperative Handle */
    useImperativeHandle(ref, () => ({
        renderFeeds: renderFeedsFunc
    }), []);

    /* On mount */
    useEffect(onMountFunc, []);


    /* -------------------------- Component -------------------------- */

    const component = <>
        <FeedSubContainer ref={subContainerTopRef} type='top' controllerRef={controllerRef} sensorRef={sensorRef} />
        <FeedSubContainer ref={subContainerMiddleRef} type='middle' controllerRef={controllerRef} sensorRef={sensorRef} />
        <FeedSubContainer ref={subContainerBottomRef} type='bottom' controllerRef={controllerRef} sensorRef={sensorRef} />
        {!firstOrLast && <Sensor ref={sensorRef} feeds={feeds} controllerRef={controllerRef} subContainerBottomRef={subContainerBottomRef} isMainSensor={isMainFeedContainer} />}
    </>;
    return (render.current && component);
});

/*
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
*/

/* ----------------------------------------- FeedSubContainer • Component ----------------------------------------- */

const FeedSubContainerWidget = forwardRef((props: FEED_SUB_CONTAINER_PROPS_TYPE, ref: any) => {
    /* -------------------------- Constants -------------------------- */

    const refresher = useRef(false);
    const [refresh, setRefresh] = useState(refresher.current);

    const isMounted = useRef(false);
    const render = useRef(true);

    const wid = useRef(props.wid || generateIdFunc()).current;
    const type = props.type;
    const controllerRef = props.controllerRef;
    const sensorRef = props.sensorRef;
    const rmode = props.renderingMode;

    const renderingMode = useRef<RENDERING_MODE_TYPE>(rmode || 'space');

    const feedComponents = useRef<any[]>([]);

    const feeds = useRef<JSON_DEFAULT_TYPE[]>([]);
    const feedContainerFoL = useRef<'first' | 'last' | undefined>(undefined);
    const feedContainerRef = useRef(undefined);

    const scaffoldId = controllerRef.current.scaffoldId;

    /* forest */
    const forest = controllerRef.current.forest;
    const forestName = controllerRef.current.forestName;
    const branchName = controllerRef.current.branchName;


    /* -------------------------- Methods -------------------------- */

    /* Refresh component */
    const refreshFunc = () => { refresher.current = !refresher.current; setRefresh(refresher.current) };

    /* On mount */
    const onMountFunc = () => {
        if (isMounted.current) return;
        isMounted.current = true;

        /* - */
        if (type === 'bottom') sensorRef?.current?.setBottomSubContainerRef({ ref: ref });

        /* clean up */
        return () => onUnmountFunc();
    };

    /* On unmount */
    const onUnmountFunc = () => { };



    /* APIs */

    /* Render space | Clear */
    const renderSpaceFunc = (): FUNCTION_DEFAULT_RETURN_TYPE => {
        let res: FUNCTION_DEFAULT_RETURN_TYPE = { ok: true, log: '', data: undefined };
        try {
            renderingMode.current = 'space';
            refreshFunc();

        } catch (e: any) { res.ok = false; res.log = e.message }
        return res;
    };

    /* Render feeds */
    const renderFeedsFunc = (x: FSC_RENDER_FEED_ARG_TYPE): FUNCTION_DEFAULT_RETURN_TYPE => {
        let res: FUNCTION_DEFAULT_RETURN_TYPE = { ok: true, log: '', data: undefined };
        try {
            renderingMode.current = 'feeds';
            const feeds = x.feeds;
            const createFeedComponentFunc = controllerRef.current.createFeedComponent;
            for (let i = 0; i < feeds.length; i++) {
                const currentFeed = feeds[i];
                const feedComp = createFeedComponentFunc(currentFeed, generateIdFunc());
                const wref = generateRefsFunc({ count: 1 });
                const wrapperComp = <FeedWrapper ref={wref[0]} key={generateIdFunc()} controllerRef={controllerRef} component={feedComp} feedData={currentFeed} />
                feedComponents.current.push(wrapperComp);
            }
            refreshFunc();

        } catch (e: any) { res.ok = false; res.log = e.message }
        return res;
    };

    /* Render Container */
    const renderContainerFunc = (x: FSC_RENDER_CONTAINER_ARG_TYPE): FUNCTION_DEFAULT_RETURN_TYPE => {
        let res: FUNCTION_DEFAULT_RETURN_TYPE = { ok: true, log: '', data: undefined };
        try {
            renderingMode.current = 'container';
            feedContainerFoL.current = x.firstOrLast;
            feeds.current = x.feeds;
            refreshFunc();

        } catch (e: any) { res.ok = false; res.log = e.message }
        return res;
    };


    /* -------------------------- Imperative Handle & Effects -------------------------- */

    /* Imperative Handle */
    useImperativeHandle(ref, () => ({
        renderSpace: renderSpaceFunc,
        renderFeeds: renderFeedsFunc,
        renderContainer: renderContainerFunc,
    }), []);

    /* On mount */
    useEffect(onMountFunc, []);


    /* -------------------------- Component -------------------------- */

    const component = <>
        {renderingMode.current === 'space' && <></>}
        {renderingMode.current === 'feeds' && <>{feedComponents.current}</>}
        {renderingMode.current === 'container' && <><FeedContainer ref={feedContainerRef} controllerRef={controllerRef} sensorRef={sensorRef} feeds={feeds.current} firstOrLast={feedContainerFoL.current} /></>}
    </>;
    return (render.current && component);
});
const FeedSubContainer = memo(FeedSubContainerWidget, () => true);

/* 
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
*/

/* ----------------------------------------- FeedWrapper • Component ----------------------------------------- */

const FeedWrapper = forwardRef((props: FEED_WRAPPER_PROPS_ARG_TYPE, ref: any) => {
    /* -------------------------- Constants -------------------------- */

    const refresher = useRef(false);
    const [refresh, setRefresh] = useState(refresher.current);

    const isMounted = useRef(false);
    const render = useRef(true);

    const wid = useRef(props.wid || generateIdFunc()).current;
    const controllerRef: { current: FL_INTERNAL_METHODS_TYPE } = props.controllerRef;
    const feedComponent = useRef(props.component);
    const feedData = props.feedData;

    const pk = controllerRef.current.primaryKey;
    const feedID = feedData[pk]; /* Feed's primary key's value */

    const wrapperId = useRef(generateIdFunc()).current;
    const wrapperEl = useRef<JQuery<HTMLElement>>(undefined);

    const wcontentId = useRef(generateIdFunc()).current;
    const wcontentEl = useRef<JQuery<HTMLElement>>(undefined);

    const remove = useRef(false);
    const visible = useRef(true);

    const feedSubContainerTopRef = useRef<FSC_INTERNAL_METHODS_TYPE>(undefined);
    const feedSubContainerBottomRef = useRef<FSC_INTERNAL_METHODS_TYPE>(undefined);

    const scaffoldId = controllerRef.current.scaffoldId;
    const scaffoldEl = $(`#${scaffoldId}`);

    const mode = controllerRef.current.mode;

    const wrapperDim = useRef({ width: 'auto', height: 'auto', margin: '0px' });
    const columns = controllerRef.current.columns;
    if (mode === 'gallery' && !isMounted.current) {
        const d = (scaffoldEl.width()! / 3) + 'px';
        wrapperDim.current.width = d;
        wrapperDim.current.height = d;
    }

    /* forest */
    const forest = controllerRef.current.forest;
    const forestName = controllerRef.current.forestName;
    const branchName = controllerRef.current.branchName;


    /* -------------------------- Methods -------------------------- */

    /* Refresh component */
    const refreshFunc = () => { refresher.current = !refresher.current; setRefresh(refresher.current) };

    /* On mount */
    const onMountFunc = () => {
        if (isMounted.current) return;
        isMounted.current = true;

        /* Add to map */
        addToMapFunc();

        /* Observe feed */
        observeFeedFunc({
            wrapperId: wrapperId,
            callback: (x: WATCH_SENSOR_CALLBACK_ARG_TYPE) => {
                if (x.visible) visibleFeedsIdDATA.current[scaffoldId][feedID] = { wrapperId: wrapperId, feedId: feedID };
                else delete visibleFeedsIdDATA.current[scaffoldId][feedID];
                controllerRef.current.triggerOnVisible(feedID, x.visible, x.rect);
            }
        });

        /* - */
        wrapperEl.current = $(`#${wrapperId}`);
        setWrapperDimensionsFunc();

        /* On scaffold scroll */
        $(`#${scaffoldId}`).on('scroll', () => { toggleVisibilityFunc() });

        /* clean up */
        return () => onUnmountFunc();
    };

    /* On unmount */
    const onUnmountFunc = () => { };

    /* Add to map */
    const addToMapFunc = () => {
        try {
            if (feedID) feedMapDATA.current[scaffoldId][feedID] = {
                id: feedID,
                data: feedData,
                wrapperRef: ref,
                topSubContainerRef: feedSubContainerTopRef,
                bottomSubContainerRef: feedSubContainerBottomRef
            };
        } catch (e: any) { logFunc('Err :: addToMapFunc() =>', e.message) }
    };

    /* Set wrapper dimensions */
    /* TODO :: Enable the wrapper to dynamically adjust its dimensions according to the feed dimensions */
    const setWrapperDimensionsFunc = () => {
        const wp = wrapperEl.current!;
        const w = wp.width(), h = wp.height();
        wp.css({ height: h + 'px' });
    };

    /* Show/Hide feed */
    const toggleVisibilityFunc = () => {
        const wp = wrapperEl.current!;
        const top = wp.position().top;
        const wwh = window.innerHeight * 2;

        if ((top > wwh || top < -wwh) && visible.current) {
            visible.current = false;
            refreshFunc();

        } else if ((top > -wwh && top < wwh) && !visible.current) {
            visible.current = true;
            refreshFunc();
        }
    };



    /* APIs */

    /* Update feed */
    const updateFeedFunc = (x: FW_UPDATE_FEED_ARG_TYPE): FUNCTION_DEFAULT_RETURN_TYPE => {
        let res = { ok: true, log: '', data: undefined };
        try {
            const newData = x.newData;
            const createFeedComponentFunc = controllerRef.current.createFeedComponent;
            feedComponent.current = createFeedComponentFunc(newData, generateIdFunc());
            refreshFunc();

        } catch (e: any) { res.ok = false; res.log = e.message }
        return res;
    };

    /* Remove feed */
    const removeFeedFunc = (): FUNCTION_DEFAULT_RETURN_TYPE => {
        let res = { ok: true, log: '', data: undefined };
        try {
            remove.current = true;
            refreshFunc();

        } catch (e: any) { res.ok = false; res.log = e.message }
        return res;
    };

    /* Restore feed */
    const restoreFeedFunc = (): FUNCTION_DEFAULT_RETURN_TYPE => {
        let res = { ok: true, log: '', data: undefined };
        try {
            remove.current = false;
            refreshFunc();

        } catch (e: any) { res.ok = false; res.log = e.message }
        return res;
    };


    /* -------------------------- Imperative Handle & Effects -------------------------- */

    /* Imperative Handle */
    useImperativeHandle(ref, () => ({
        updateFeed: updateFeedFunc,
        removeFeed: removeFeedFunc,
        restoreFeed: restoreFeedFunc
    }), []);

    /* On mount */
    useEffect(onMountFunc, []);


    /* -------------------------- Component -------------------------- */

    const component = <>
        <FeedSubContainer ref={feedSubContainerTopRef} type='top' controllerRef={controllerRef} />
        {!remove.current &&
            <div id={wrapperId} style={wrapperDim.current} className='rel column_center_all'>
                {/* <div id={wcontentId} style={{ width: 'auto', height: 'auto' }} >{visible.current && feedComponent.current}</div> */}
                {visible.current && feedComponent.current}
            </div>
        }
        <FeedSubContainer ref={feedSubContainerBottomRef} type='bottom' controllerRef={controllerRef} />
    </>;
    return (render.current && component);
});

/*
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
*/

/* ----------------------------------------- Sensor • Component ----------------------------------------- */

const Sensor = forwardRef((props: SENSOR_PROPS_TYPE, ref: any) => {
    /* -------------------------- Constants -------------------------- */

    const refresher = useRef(false);
    const [refresh, setRefresh] = useState(refresher.current);

    const isMounted = useRef(false);
    const render = useRef(true);

    const wid = useRef(props.wid || generateIdFunc()).current;
    const feeds = useRef(props.feeds || []);
    const controllerRef = props.controllerRef;
    const subContainerBottomRef = useRef(props.subContainerBottomRef);
    const isMainSensor = props.isMainSensor;

    const scaffoldHeight = document.getElementById(`${controllerRef.current.scaffoldId}`)!.getBoundingClientRect().height;

    const sensorEl = useRef<HTMLElement>(null);
    const isSensorVisible = useRef(false);
    const shouldRenderFeeds = useRef(false);

    const cancelReqAnimFrame = useRef(false);
    const suspendWatcher = useRef(false);
    const watcherTimeout = useRef(50);

    const isRenderingMoreFeeds = useRef(false);

    const renderingBatchCount = useRef(0);
    const getIdealFeedCountPerBatch = useRef(true);


    /* -------------------------- Methods -------------------------- */

    /* Refresh component */
    const refreshFunc = () => { refresher.current = !refresher.current; setRefresh(refresher.current) };

    /* On mount - Run once */
    const onMountFunc = () => {
        if (isMounted.current) return;
        isMounted.current = true;

        /* watch sensor */
        watchSensorFunc();

        /* clean up */
        return () => onUnmountFunc();
    };

    /* On unmount */
    const onUnmountFunc = () => { };

    /* Watch sensor */
    const watchSensorFunc = () => {
        if (cancelReqAnimFrame.current) return;
        if (!suspendWatcher.current) {
            suspendWatcher.current = true;

            /* Get sensor element */
            const el = sensorEl.current || document.getElementById(wid);
            if (!el) return;
            if (!sensorEl.current) sensorEl.current = el;

            /* Get sensor offset */
            const rect = el.getBoundingClientRect();
            const top = rect.top;

            /* Track sensor visibility */
            const visible = top >= 0 && top <= window.innerHeight;
            const visibility = isSensorVisible.current;
            if (visible && !isSensorVisible.current) isSensorVisible.current = true;
            else if (!visible && isSensorVisible.current) isSensorVisible.current = false;
            if (visibility !== isSensorVisible.current) onVisibleFunc({ isVisible: isSensorVisible.current });

            /* Render more feeds */
            const renderMore = (top - scaffoldHeight) < scaffoldHeight && feeds.current.length > 0;
            const rdm = shouldRenderFeeds.current;
            if (renderMore && !shouldRenderFeeds.current) shouldRenderFeeds.current = true;
            else if (!renderMore && shouldRenderFeeds.current) shouldRenderFeeds.current = false;
            if (rdm !== shouldRenderFeeds.current) {
                renderMoreFeedsFunc();
                shouldRenderFeeds.current = false;
                renderingBatchCount.current += 1;
            }

            /* On second rendering */
            if (isMainSensor && renderingBatchCount.current === 2 && getIdealFeedCountPerBatch.current) {
                getIdealFeedCountPerBatch.current = false;
                console.log('second rd ::', top);
            }

            /* - */
            setTimeout(() => { suspendWatcher.current = false }, watcherTimeout.current);
        }
        requestAnimationFrame(watchSensorFunc);
    };

    /* On visible */
    const onVisibleFunc = (x: { isVisible: boolean }) => {
        const isVisible = x.isVisible;
        const emptyList = feeds.current.length === 0;
        if (isVisible && isMainSensor && emptyList) controllerRef.current.triggerOnListEndReached();
        else if (isVisible && !isMainSensor && emptyList) cancelReqAnimFrame.current = true;
    };

    /* Render more feeds */
    const renderMoreFeedsFunc = () => {
        if (isRenderingMoreFeeds.current) return;
        try {
            isRenderingMoreFeeds.current = true;
            let firstBatch = controllerRef.current.firstBatch;
            firstBatch = renderingBatchCount.current >= 2 ? firstBatch * 2 : firstBatch;
            (subContainerBottomRef.current).current?.renderContainer({ feeds: feeds.current.splice(0, firstBatch), firstOrLast: 'last' });
            isRenderingMoreFeeds.current = false;

        } catch (e: any) { console.log('err :: renderMoreFeedsFunc() =>', e.message) }
    };

    /* Set bottom sub container ref */
    const setBottomSubContainerRefFunc = (x: SENSOR_SET_BOTTOM_SC_REF_ARG_TYPE) => { subContainerBottomRef.current = x.ref; };


    /* -------------------------- Imperative Handle & Effects -------------------------- */

    /* Imperative Handle */
    useImperativeHandle(ref, () => ({
        setBottomSubContainerRef: setBottomSubContainerRefFunc
    }), []);

    /* On mount */
    useEffect(onMountFunc, []);


    /* -------------------------- Component -------------------------- */

    const component = <><div id={wid} style={{ width: '0px', height: '0px' }} /></>;
    return (render.current && component);
});

/*
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
-
*/

/* ----------------------------------------- Loading • Component ----------------------------------------- */

const Loading = forwardRef((props: { wid?: string, visible?: boolean }, ref: any) => {
    /* -------------------------- Constants -------------------------- */

    const refresher = useRef(false);
    const [refresh, setRefresh] = useState(refresher.current);

    const isMounted = useRef(false);
    const render = useRef(props.visible || false);

    const wid = useRef(props.wid || generateIdFunc()).current;


    /* -------------------------- Methods -------------------------- */

    /* Refresh component */
    const refreshFunc = () => { refresher.current = !refresher.current; setRefresh(refresher.current) };

    /* On mount - Run once */
    const onMountFunc = () => {
        if (isMounted.current) return;
        isMounted.current = true;

        /* clean up */
        return () => onUnmountFunc();
    };

    /* On unmount */
    const onUnmountFunc = () => { };

    /* Show loading */
    const showLoadingFunc = () => { };

    /* Hide loading */
    const hideLoadingFunc = () => { };


    /* -------------------------- Imperative Handle & Effects -------------------------- */

    /* Imperative Handle */
    useImperativeHandle(ref, () => ({
        show: showLoadingFunc,
        hide: hideLoadingFunc
    }), []);

    /* On mount */
    useEffect(onMountFunc, []);


    /* -------------------------- Component -------------------------- */

    const component = <></>;
    return (render.current && component);
});


