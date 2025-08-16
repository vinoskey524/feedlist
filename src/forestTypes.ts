export type FOREST_DB_TYPE = Pick<MAIN_TYPE,
    'store' | 'session' | 'return' | 'method' | 'onTree' | 'mutation' | 'condition'
    | 'watch' | 'useWatcher' | 'trigger' | 'extract' | 'ws' | 'fs' | 'http'
>;

type STRING_ARR_TYPE = string | string[];

type MAIN_TYPE = {
    /**
    * Add a method to the chain 
    * @returns 
    */
    _chain: (x: any) => void,


    /**
    * Do bulk operations (bulkOps)
    * @returns
    */
    bulk: () => void,


    /**
    * Store simple "key: value" pair
    * @returns
    */
    store: (x: JSON_BASIC_TYPE, y?: (number | string)[]) => FUNCTION_BASIC_RETURN_TYPE,


    /**
    * Store user session data as simple "key: value" pair
    * @returns
    */
    session: (x: JSON_BASIC_TYPE, y?: (number | string)[]) => FUNCTION_BASIC_RETURN_TYPE,


    /**
    * Store simple "key: value" pair
    * @returns
    */
    return: (x: RETURN_ARG_TYPE) => RETURN_RETURN_TYPE,


    /**
    * Return a list of multiple methods
    * @returns
    */
    method: () => METHOD_RETURN_TYPE,


    /**
    * Select a tree
    * @param x - The tree name
    * @param options? - Additional options
    * @returns
    */
    onTree: (x: string, options?: { transactionId?: string }) => ONTREE_RETURN_TYPE,


    /**
    * Insert new data
    * @param x - data as object or array of objects
    * @param options 
    * @returns 
    */
    set: (x: JSON_BASIC_TYPE, options?: {}) => SET_RETURN_TYPE,


    /**
    * Update existing data
    * @param x 
    * @returns 
    */
    update: (x: UPDATE_ARG_TYPE) => UPDATE_RETURN_TYPE,


    /**
    * Update all existing data, matching a certain condition if provided, on a branch.
    * @param x
    * @returns 
    */
    updateAll: (x: UPDATE_ALL_ARG_TYPE) => UPDATE_ALL_RETURN_TYPE,


    /**
    * Get data
    * @param x 
    * @returns 
    */
    get: (x: GET_ARG_TYPE) => GET_RETURN_TYPE,


    /**
    * Delete data
    * @param x 
    * @returns 
    */
    delete: <T extends DELETE_ARG_X_TYPE>(x: T, y?: DELETE_ARG_Y_TYPE) => DELETE_RETURN_TYPE<T>,


    /**
    * Sort data
    * @param x 
    * @returns 
    */
    orderBy: (x: ORDERBY_ARG_X_TYPE, y?: ORDERBY_ARG_Y_TYPE) => ORDERBY_RETURN_TYPE,


    /**
    * Limit the number of fetchable data
    * @param x = number or percentage
    * @returns 
    */
    limit: (x: LIMIT_ARG_TYPE) => LIMIT_RETURN_TYPE,


    /**
    * Join another querie
    * @param x = join id
    * @returns 
    */
    join: (x: string) => JOIN_RETURN_TYPE,


    /**
    * Run transaction asynchroniously
    * @returns 
    */
    end: () => Promise<FUNCTION_BASIC_RETURN_TYPE>,


    /**
    * Mutation
    * @returns 
    */
    mutation: () => MUTATION_RETURN_TYPE,


    /**
    * Condition
    * @returns 
    */
    condition: () => CONDITION_RETURN_TYPE,


    /**
    * Watch feed, branch and store
    * @returns
    */
    watch: (x?: string) => WATCH_RETURN_TYPE,


    /**
    * Use Watcher
    * @returns
    */
    useWatcher: (x: USE_WATCHER_ARG_TYPE) => USE_WATCHER_RETURN_TYPE,


    /**
    * Trigger
    * @returns
    */
    trigger: (x?: TRIGGER_ARG_X_TYPE, y?: TRIGGER_ARG_Y_TYPE) => TRIGGER_RETURN_TYPE,


    /**
    * Extract
    * @returns
    */
    extract: <T extends EXTRACT_ARG_X_TYPE>(...args: EXTRACT_ALL_ARG_TYPE<T>) => FUNCTION_BASIC_RETURN_TYPE,


    /**
    * Manage ws
    * @returns
    */
    ws: () => WS_RETURN_TYPE,


    /**
    * Manage fs
    * @returns
    */
    fs: () => FS_RETURN_TYPE,


    /**
    * Manage http request
    * @returns
    */
    http: () => HTTP_RETURN_TYPE


    /**
    * Execute query between Clients and Servers
    * @returns
    */
    // query: () => QUERY_RETURN_TYPE,
    query: () => void,
};


type PLG_WS_TYPE = {
    /** Configure WebSocket server */
    as_server?: { websocket: any, port: number },
    /** Configure WebSocket client(s) */
    as_client?: {
        /** websocket */
        websocket: any,
        /** Servers to connect to */
        servers: { id: string, host: string, port?: number } | { id: string, host: string, port?: number }[],
    }
};
type PLG_HTTP_TYPE = {
    /** Configure http server */
    as_server?: {
        /** Choose the server that matches your runtime */
        deno?: { api: any, response: any }, /** use "Deno" instance as API */
        node?: { express: any, cors: any, bodyParser: any, formidable: any, compression?: any, helmet?: any },
        bun?: { api: any, response: any }, /** use "Bun" instance as API */
        /** Port */
        port: number,
        /** Endpoint - The default route name */
        endpoint?: string,
        /** Default "0.0.0.0" (Listen to all available network interfaces) - Can be the domain name or the address of your server */
        host?: string,
        /** Max request timeout in milliseconds - 30_000ms by default */
        timeout?: number,
        /** Maximum request size limit in MB - Default "256MB" */
        requestSizeLimit?: number,
        /** Static files to serve */
        staticFiles?: {
            /** Default is "static" - Then you can access files for example via "http://locahost/static/myfile.png" */
            routeName?: string,
            /** The path of the directory containing static files */
            path: string
        }
    },
    /** Configure http client */
    as_client?: {
        /** Axios API */
        axios: any,
        /** Web document API */
        document?: any,
        /** Servers to connect to */
        servers: { id: string, url: string, endpoint?: string } | { id: string, url: string, endpoint?: string }[],
    }
};
type PLG_FS_TYPE = {
    /** For "Deno" and "Bun" */
    api?: any,
    /** "fs/Promise" package */
    fs?: any,
    /** Location to store "forest" folder */
    storagePath?: string
    /** FNSS (Filename Secure Storage) - If true, unlock the storage function */
    // FNSS?: boolean
};
type INIT_ARG_TYPE = {
    /**
    * The main key (mk) for each feed.
    * Ensure yourself that the "mk" is unique in your forest to avoid collision or data overwritting.
    */
    mainKey: string,
    /** Server id - used for session */
    // serverId?: string,
    /** Default date formats */
    dateFormat: CONDITION_DATE_FORMAT[],
    /** Schema of all branches */
    // schema?: BRANCH_SCHEMA_TYPE,
    /** The LIB (Let It Breath) */
    // LIB?: { rate: number, ms: number },
    /** Plugins */
    plugins?: {
        /** Runtime */
        runtime: RUN_TIME_TYPE,
        /** WebSocket for forest inter-connection */
        ws?: PLG_WS_TYPE,
        /** http */
        http?: PLG_HTTP_TYPE,
        /** File system */
        fs?: PLG_FS_TYPE
        /** Crypto */
        crypto?: {
            crypto?: any,
            /** A 32 length alphanumeric string - (Recommended)*/
            secretKey?: string,
            /** If "true", enable crypto */
            enable: boolean
        }
    }
};


type DB_TYPE = {
    init: (x?: INIT_ARG_TYPE) => Pick<MAIN_TYPE,
        'store' | 'session' | 'return' | 'method' | 'onTree' | 'mutation' | 'condition'
        | 'watch' | 'useWatcher' | 'trigger' | 'extract' | 'ws' | 'fs' | 'http'
    >
};


type RETURN_ARG_TYPE = '*' | string | string[];
type RETURN_RETURN_TYPE = {
    fromFeed: (x: string) => FUNCTION_BASIC_RETURN_TYPE,
    fromStore: () => FUNCTION_BASIC_RETURN_TYPE,
    fromSession: () => FUNCTION_BASIC_RETURN_TYPE
};


type METHOD_RETURN_TYPE = {
    /** Generated a random id - Return a string*/
    generateId: () => string,

    /** 
    * Check if a Json object has  
    * @param x A json Object
    * @param y The key you're searching for
    * @return boolean
    */
    hasProperty: (x: JSON_BASIC_TYPE, y: string) => boolean,

    /**
    * Clone a json object or an array
    * @param x A json or an array
    * @returns The cloned object or an empty array or an empty json if an error occur
    */
    cloneObject: (x: JSON_BASIC_TYPE | any[]) => JSON_BASIC_TYPE | any[],

    /**
    * Merge two json object.
    *
    * This function doesn't modify the original json objects
    * @param x Target
    * @param y Source
    * @returns 
    */
    mergeJson: (x: { target: JSON_BASIC_TYPE, source: JSON_BASIC_TYPE }) => JSON_BASIC_TYPE,

    // /**
    // * Delete a json field
    // *
    // * It doesn't modify the original json object
    // * @param target The json object
    // * @param path The path to the field
    // * @returns An object like { status: 'success' | 'error', log: string, data: JSON_BASIC_TYPE }
    // */
    // deleteJsonField: (x: { target: JSON_BASIC_TYPE, path: string | (string | number)[] }) => JSON_BASIC_TYPE,

    /**
    * Return the type of a variable
    * 
    * @param x The variable
    * @returns The data type
    */
    getTypeOf: (x: any) => string,

    /**
    * Check if a string is alphanumeric
    * @param x The string
    * @returns 
    */
    isAlphanumeric: (x: string) => boolean,

    /** 
    * Hash a string
    *
    * @param x The string
    * @returns The hashed string
    */
    createHash: (x: string) => Promise<FUNCTION_BASIC_RETURN_TYPE>
};


type ONTREE_RETURN_TYPE = Pick<MAIN_TYPE, 'set' | 'update' | 'updateAll' | 'get' | 'delete'>;


type JOIN_RETURN_TYPE = ONTREE_RETURN_TYPE;


type WHERE_ARG_PRE_TYPE = { [key: string]: string | number | boolean | object | undefined | void };
type WHERE_ARG_TYPE = WHERE_ARG_PRE_TYPE | WHERE_ARG_PRE_TYPE[];


type SET_RETURN_TYPE_FOR_ONBRANCH = Pick<MAIN_TYPE, 'join' | 'end'>;
type SET_RETURN_TYPE = { onBranch: (x: string) => SET_RETURN_TYPE_FOR_ONBRANCH };


type UPDATE_ARG_TYPE = JSON_BASIC_TYPE | JSON_BASIC_TYPE[];
type UPDATE_RETURN_TYPE_FOR_WHERE = Pick<MAIN_TYPE, 'join' | 'end'>;
type UPDATE_RETURN_TYPE = {
    where: (x: WHERE_ARG_TYPE) => UPDATE_RETURN_TYPE_FOR_WHERE,
    join: (x: string) => JOIN_RETURN_TYPE,
    end: () => Promise<FUNCTION_BASIC_RETURN_TYPE>
};


type UPDATE_ALL_ARG_TYPE = JSON_BASIC_TYPE;
type UPDATE_ALL_RETURN_TYPE_FOR_WHERE = Pick<MAIN_TYPE, 'orderBy' | 'limit' | 'join' | 'end'>;
type UPDATE_ALL_RETURN_TYPE_FOR_ONBRANCH = {
    where: (x: WHERE_ARG_TYPE) => UPDATE_ALL_RETURN_TYPE_FOR_WHERE,
    orderBy: (x: ORDERBY_ARG_X_TYPE, y?: ORDERBY_ARG_Y_TYPE) => ORDERBY_RETURN_TYPE,
    limit: (x: LIMIT_ARG_TYPE) => LIMIT_RETURN_TYPE,
    join: (x: string) => JOIN_RETURN_TYPE,
    end: () => Promise<FUNCTION_BASIC_RETURN_TYPE>
};
type UPDATE_ALL_RETURN_TYPE = {
    onBranch: (x: string) => UPDATE_ALL_RETURN_TYPE_FOR_ONBRANCH
};


type GET_ARG_TYPE = '*' | string | Array<string>;
type GET_RETURN_TYPE_FOR_WHERE = Pick<MAIN_TYPE, 'orderBy' | 'limit' | 'join' | 'end'>;
type GET_RETURN_TYPE_FOR_ONBRANCH = {
    where: (x: WHERE_ARG_TYPE) => GET_RETURN_TYPE_FOR_WHERE,
    orderBy: (x: ORDERBY_ARG_X_TYPE, y?: ORDERBY_ARG_Y_TYPE) => ORDERBY_RETURN_TYPE,
    limit: (x: LIMIT_ARG_TYPE) => LIMIT_RETURN_TYPE,
    join: (x: string) => JOIN_RETURN_TYPE,
    end: () => Promise<FUNCTION_BASIC_RETURN_TYPE>
};
type GET_RETURN_TYPE = {
    fromBranch: (x: string) => GET_RETURN_TYPE_FOR_ONBRANCH
};


type DELETE_ARG_X_TYPE = 'field' | 'feed' | 'branch';
type DELETE_ARG_Y_TYPE = '*' | string | string[];
type DELETE_FEED_RETURN_TYPE_FOR_FROMBRANCH = {
    where: (x: WHERE_ARG_TYPE) => DELETE_FEED_RETURN_TYPE_FOR_WHERE,
    orderBy: (x: ORDERBY_ARG_X_TYPE, y?: ORDERBY_ARG_Y_TYPE) => ORDERBY_RETURN_TYPE,
    limit: (x: LIMIT_ARG_TYPE) => LIMIT_RETURN_TYPE,
    join: (x: string) => JOIN_RETURN_TYPE,
    end: () => Promise<FUNCTION_BASIC_RETURN_TYPE>
};
type DELETE_FEED_RETURN_TYPE_FOR_WHERE = Pick<MAIN_TYPE, 'orderBy' | 'limit' | 'join' | 'end'>;
/* - */
type DELETE_RETURN_TYPE<T> = T extends 'field' ? { fromBranch: (x: string) => DELETE_FEED_RETURN_TYPE_FOR_FROMBRANCH }
    : T extends 'feed' ? { fromBranch: (x: string) => DELETE_FEED_RETURN_TYPE_FOR_FROMBRANCH }
    : T extends 'branch' ? { join: (x: string) => JOIN_RETURN_TYPE, end: () => Promise<FUNCTION_BASIC_RETURN_TYPE> }
    : {};


type ORDERBY_ARG_X_TYPE = string;
type ORDERBY_ARG_Y_TYPE = 'ASC' | 'DESC';
type ORDERBY_RETURN_TYPE = Pick<MAIN_TYPE, 'limit' | 'join' | 'end'>;


type LIMIT_ARG_TYPE = number;
type LIMIT_RETURN_TYPE = Pick<MAIN_TYPE, 'join' | 'end'>;


type ARRAY_TWO_STRING_TYPE = [string, string];
type ARRAY_TWO_NUMBER_TYPE = [number, number];


type MUTATION_ACTION_TYPE_FOR_NUMBER = 'set' | 'increment' | 'decrement' | 'multiply' | 'divide' | 'increaseBy' | 'decreaseBy' | 'custom';
type MUTATION_ACTION_TYPE_FOR_STRING = 'set' | 'concat_before' | 'concat_after' | 'upper' | 'lower' | 'custom';
type MUTATION_ACTION_TYPE_FOR_BOOLEAN = 'set' | 'invert_boolean' | 'custom';
type MUTATION_ACTION_TYPE_FOR_OBJECT = 'set' | 'push' | 'push_content' | 'assign' | 'custom' | MUTATION_ACTION_TYPE_FOR_NUMBER | MUTATION_ACTION_TYPE_FOR_STRING | MUTATION_ACTION_TYPE_FOR_BOOLEAN;
/* - */
type MUTATION_ARG_TYPE_FOR_NUMBER = { action: MUTATION_ACTION_TYPE_FOR_NUMBER, path?: string, value?: number, customMutation?: Function, keepPositive?: boolean };
type MUTATION_ARG_TYPE_FOR_STRING = { action: MUTATION_ACTION_TYPE_FOR_STRING, path?: string, value?: string, customMutation?: Function, };
type MUTATION_ARG_TYPE_FOR_BOOLEAN = { action: MUTATION_ACTION_TYPE_FOR_BOOLEAN, path?: string, value?: boolean, customMutation?: Function, };
type MUTATION_ARG_TYPE_FOR_OBJECT = { action: MUTATION_ACTION_TYPE_FOR_OBJECT, path?: string | string[] | (number | string)[], value?: string | number | boolean | object, customMutation?: Function, };

// type MUTATION_RETURN_TYPE_FOR_OBJECT<T extends MUTATION_ACTION_TYPE_FOR_OBJECT> = { mutation: MUTATION_ARG_TYPE_FOR_NUMBER[] | MUTATION_ARG_TYPE_FOR_STRING[] | MUTATION_ARG_TYPE_FOR_BOOLEAN[] | MUTATION_ARG_TYPE_FOR_OBJECT<T>[], _$$type: 'number' | 'string' | 'boolean' | 'object', _$$isMutation: true };
type MUTATION_RETURN_TYPE = {
    /**
    * number mutation
    * @param x 
    * @params action ->
    * @params value ->
    * @params keepPositive? ->
    * @returns 
    */
    number: (x: MUTATION_ARG_TYPE_FOR_NUMBER | MUTATION_ARG_TYPE_FOR_NUMBER[]) => void,

    /**
    * string mutation
    * @param x 
    * @returns 
    */
    string: (x: MUTATION_ARG_TYPE_FOR_STRING | MUTATION_ARG_TYPE_FOR_STRING[]) => void,

    /**
    * boolean mutation
    * @param x 
    * @returns 
    */
    boolean: (x: MUTATION_ARG_TYPE_FOR_BOOLEAN | MUTATION_ARG_TYPE_FOR_BOOLEAN[]) => void,

    /**
    * object (json and array) mutation
    * @param x 
    * @returns 
    */
    object: (x: MUTATION_ARG_TYPE_FOR_OBJECT | MUTATION_ARG_TYPE_FOR_OBJECT[]) => void,
    // object: <T extends MUTATION_ACTION_TYPE_FOR_OBJECT>(x: MUTATION_ARG_TYPE_FOR_OBJECT<T> | MUTATION_ARG_TYPE_FOR_OBJECT<T>[]) => void,
};




type CONDITION_OPERATOR_FOR_NUMBER = '===' | '!==' | '>' | '>=' | '<=' | '<' | '<>' | '!<>' | '<*>' | '!<*>' | '><' | '>*<' | '!><' | '!>*<' | '<?>' | '!<?>' | '%' | 'custom';
type CONDITION_OPERATOR_FOR_STRING = '===' | '!==' | '<>' | '!<>' | '<*>' | '!<*>' | '<?>' | '!<?>' | 'L==' | 'L>' | 'L>=' | 'L<' | 'L<=' | 'wL==' | 'wL>' | 'wL>=' | 'wL<' | 'wL<=' | 'custom';
type CONDITION_OPERATOR_FOR_BOOLEAN = '===' | '!==' | 'custom';
type CONDITION_OPERATOR_FOR_DATE = '===' | '!==' | '>' | '>=' | '<=' | '<' | '<>' | '!<>' | '<*>' | '!<*>' | '><' | '>*<' | '!><' | '!>*<' | '<?>' | '!<?>' | '=Q1' | '=Q2' | '=Q3' | '=Q4' | '=S1' | '=S2' | /* 'Y->' | 'M->' | 'Dt->' | 'Dy->' | 'H->' | 'Mn->' | 'S->' | 'T->' | 'D??' | 'N??' | */ 'custom';
type CONDITION_OPERATOR_FOR_OBJECT = CONDITION_OPERATOR_FOR_NUMBER | CONDITION_OPERATOR_FOR_STRING | CONDITION_OPERATOR_FOR_DATE | '[*]' | '![*]' | '[?]' | '![?]' | '[=]' | '{k}' | '!{k}' | '{k*}' | '!{k*}' | '{v}' | '!{v}' | '{v*}' | '!{v*}' | '{=}';
/* - */
type CONDITION_VALUE_TYPE_FOR_NUMBER = number | number[] | ARRAY_TWO_NUMBER_TYPE | ARRAY_TWO_NUMBER_TYPE[];
type CONDITION_VALUE_TYPE_FOR_STRING = number | string | string[] | (string[] | string)[];
type CONDITION_VALUE_TYPE_FOR_BOOLEAN = boolean;
type CONDITION_VALUE_TYPE_FOR_DATE = number | number[] | string | string[] | (number | number[] | string | string[])[] | ARRAY_TWO_NUMBER_TYPE | ARRAY_TWO_NUMBER_TYPE[] | ARRAY_TWO_STRING_TYPE | ARRAY_TWO_STRING_TYPE[];
/* - */
type CONDITION_DATE_FORMAT = 'YYYY_MM_DD' | 'DD_MM_YYYY' | 'MM_DD_YYYY';
/* - */
type CONDITION_ARG_TYPE_FOR_NUMBER = { operator: CONDITION_OPERATOR_FOR_NUMBER, path?: string | (string | number)[], value?: CONDITION_VALUE_TYPE_FOR_NUMBER, permutation?: Function, customCondition?: Function, case_sensitive?: boolean };
type CONDITION_ARG_TYPE_FOR_STRING = { operator: CONDITION_OPERATOR_FOR_STRING, path?: string | (string | number)[], value?: CONDITION_VALUE_TYPE_FOR_STRING, permutation?: Function, customCondition?: Function, case_sensitive?: boolean };
type CONDITION_ARG_TYPE_FOR_BOOLEAN = { operator: CONDITION_OPERATOR_FOR_BOOLEAN, path?: string | (string | number)[], value?: CONDITION_VALUE_TYPE_FOR_BOOLEAN, permutation?: Function, customCondition?: Function };
type CONDITION_ARG_TYPE_FOR_DATE = { operator: CONDITION_OPERATOR_FOR_DATE, path?: string | (string | number)[], value?: CONDITION_VALUE_TYPE_FOR_DATE, permutation?: Function, customCondition?: Function, case_sensitive?: boolean, year?: number };
type CONDITION_ARG_TYPE_FOR_OBJECT = { operator: CONDITION_OPERATOR_FOR_OBJECT, path?: string | string[], isDate?: boolean, value?: CONDITION_VALUE_TYPE_FOR_NUMBER | CONDITION_VALUE_TYPE_FOR_STRING | CONDITION_VALUE_TYPE_FOR_DATE | object | boolean, permutation?: Function, customCondition?: Function, case_sensitive?: boolean, year?: number };
type CONDITION_RETURN_TYPE = {
    /**
    * number condition
    * @param x 
    * @returns 
    */
    number: (x: CONDITION_ARG_TYPE_FOR_NUMBER | CONDITION_ARG_TYPE_FOR_NUMBER[], y?: 'OR' | 'AND') => void,

    /**
    * string condition
    * @param x 
    * @returns 
    */
    string: (x: CONDITION_ARG_TYPE_FOR_STRING | CONDITION_ARG_TYPE_FOR_STRING[], y?: 'OR' | 'AND') => void,

    /**
    * boolean condition
    * @param x 
    * @returns 
    */
    boolean: (x: CONDITION_ARG_TYPE_FOR_BOOLEAN | CONDITION_ARG_TYPE_FOR_BOOLEAN[], y?: 'OR' | 'AND') => void,

    /**
    * object condition
    * @param x 
    * @returns 
    */
    object: (x: CONDITION_ARG_TYPE_FOR_OBJECT | CONDITION_ARG_TYPE_FOR_OBJECT[], y?: 'OR' | 'AND') => void,

    /**
    * date condition
    * @param x - condition
    * @param y - condition Link
    * @returns
    */
    date: (x: CONDITION_ARG_TYPE_FOR_DATE | CONDITION_ARG_TYPE_FOR_DATE[], y?: 'OR' | 'AND') => void
};





type WATCH_FEED_ON_ARG_TYPE = { set?: Function, update?: Function, delete?: Function };
type WATCH_BRANCH_ON_ARG_TYPE = { set?: Function, delete?: Function, self_create?: Function, self_delete?: Function };
type WATCH_STORE_ON_ARG_TYPE = { set?: Function, update?: Function, delete?: Function };
/* - */
type WATCH_FEED_RETURN_TYPE = { on: (x: WATCH_FEED_ON_ARG_TYPE) => void };
type WATCH_BRANCH_RETURN_TYPE = {
    fromTree: (x: string) => {
        on: (x: WATCH_BRANCH_ON_ARG_TYPE) => void
    }
};
type WATCH_STORE_RETURN_TYPE = { on: (x: WATCH_STORE_ON_ARG_TYPE) => void };
type WATCH_ARG_TYPE = STRING_ARR_TYPE;
/* - */
type WATCH_RETURN_TYPE = {
    feed: (x: WATCH_ARG_TYPE) => WATCH_FEED_RETURN_TYPE,
    branch: (x: WATCH_ARG_TYPE) => WATCH_BRANCH_RETURN_TYPE
    store: () => WATCH_STORE_RETURN_TYPE
};




type USE_WATCHER_ARG_TYPE = string;
type USE_WATCHER_TARGET_TYPE = 'feed' | 'branch';
type USE_WATCHER_OTHER_ARG_TYPE<T extends USE_WATCHER_TARGET_TYPE> = T extends 'feed' ? [T, '*' | STRING_ARR_TYPE] : [T, '*' | STRING_ARR_TYPE, string];
type USE_WATCHER_CLEAR_ARG_TYPE<T extends USE_WATCHER_TARGET_TYPE> = T extends 'feed' ? [T] : [T, string];
type USE_WATCHER_RETURN_TYPE = {
    set: <T extends USE_WATCHER_TARGET_TYPE>(...args: USE_WATCHER_OTHER_ARG_TYPE<T>) => FUNCTION_BASIC_RETURN_TYPE,
    add: <T extends USE_WATCHER_TARGET_TYPE>(...args: USE_WATCHER_OTHER_ARG_TYPE<T>) => FUNCTION_BASIC_RETURN_TYPE,
    delete: <T extends USE_WATCHER_TARGET_TYPE>(...args: USE_WATCHER_OTHER_ARG_TYPE<T>) => FUNCTION_BASIC_RETURN_TYPE,
    clear: <T extends USE_WATCHER_TARGET_TYPE>(...args: USE_WATCHER_CLEAR_ARG_TYPE<T>) => FUNCTION_BASIC_RETURN_TYPE
};


type TRIGGER_ARG_X_TYPE = 'async';
type TRIGGER_ARG_Y_TYPE = TASK_EXECUTION_TYPE;
type TRIGGER_CREATE_ARG_TYPE = { id: string, family?: string, methods: { [func_name: string]: Function } };
type TRIGGER_WITH_ARG_TYPE = {
    run: (x: string, y?: string) => TRIGGER_RUN_RETURN_TYPE,
    fromId: (x: string) => any,
    fromFamily: (x: string) => any
};
type TRIGGER_RUN_RETURN_TYPE = {
    withArgs: (...x: any) => TRIGGER_WITH_ARG_TYPE
    // fromId: (x: string) => any,
    // fromFamily: (x: string) => any
};
type TRIGGER_RETURN_TYPE = {
    create: (x: TRIGGER_CREATE_ARG_TYPE) => FUNCTION_BASIC_RETURN_TYPE,
    run: (x: string, y?: string) => TRIGGER_RUN_RETURN_TYPE
};





type EXTRACT_ARG_X_TYPE = 'feed_id' | 'branch_name' | 'tree_name';
type EXTRACT_ALL_ARG_TYPE<T extends EXTRACT_ARG_X_TYPE> = T extends 'feed_id' ? [T, string, string]
    : T extends 'branch_name' ? [T, string]
    : T extends 'tree_name' ? [T] : [];



type TASK_EXECUTION_TYPE = 'sequential' | 'parallel';























type JSON_BASIC_TYPE = { [key: string]: any };


type FUNCTION_BASIC_RETURN_TYPE = { status: 'success' | 'error', log: string, data: any };






type RUN_TIME_TYPE = 'Deno' | 'Node' | 'Bun' | 'React_native' | 'Browser';





type WS_STATE_TYPE = { status: 'open' | 'close' | 'handshake' | 'error', log: string };
type WS_MESSAGE_OBJECT_TYPE = 'client_handshake' | 'server_handshake' | 'commit_store' | 'commit_session' | 'trigger_method' | 'trigger_back' | 'close';
type WS_TRIGGER_H_RUN_FUNC_TYPE = { name: string, alias: string, args: any[] };
type WS_TRIGGER_H_USE_CALLBACK_RETURN_TYPE = {
    fromId: (x: string) => Promise<any>,
    fromFamily: (x: string) => Promise<any>
};
type WS_TRIGGER_H_WITH_ARG_RETURN_TYPE = {
    run: (x: string, y?: string) => WS_TRIGGER_H_RUN_RETURN_TYPE,
    useCallback: (x: Function, y?: string) => WS_TRIGGER_H_USE_CALLBACK_RETURN_TYPE,
    fromId: (x: string) => Promise<any>,
    fromFamily: (x: string) => Promise<any>
};
type WS_TRIGGER_H_RUN_RETURN_TYPE = {
    // useCallback: (x: Function) => WS_TRIGGER_H_USE_CALLBACK_RETURN_TYPE,
    withArgs: (...x: any) => WS_TRIGGER_H_WITH_ARG_RETURN_TYPE,
    // fromId: (x: string) => Promise<any>,
    // fromFamily: (x: string) => Promise<any>
};
type WS_TRIGGER_WHERE_SESSION_RETURN_TYPE = {
    fromId: (x: string) => Promise<any>,
    fromFamily: (x: string) => Promise<any>
};
type WS_TRIGGER_H_WITH_ARG_SESSION_TYPE = {
    whereSession: (x: JSON_BASIC_TYPE) => WS_TRIGGER_WHERE_SESSION_RETURN_TYPE,
    run: (x: string, y?: string) => WS_TRIGGER_H_BROADCAST_RUN_RETURN_TYPE,
    fromId: (x: string) => Promise<any>,
    fromFamily: (x: string) => Promise<any>
};
type WS_TRIGGER_H_BROADCAST_RUN_RETURN_TYPE = {
    // whereSession: (x: JSON_BASIC_TYPE) => WS_TRIGGER_WHERE_SESSION_RETURN_TYPE,
    withArgs: (...x: any) => WS_TRIGGER_H_WITH_ARG_SESSION_TYPE,
    // fromId: (x: string) => Promise<any>,
    // fromFamily: (x: string) => Promise<any>
};
type WS_RETURN_TYPE = {
    /* get all clients and server id */
    get: () => {
        clients: (x?: 'count') => Promise<string[] | number>
        servers: (x?: 'count') => Promise<string[] | number>
    },
    /* trigger method(s) on one server */
    useServer: (x: string) => {
        trigger: (x?: TASK_EXECUTION_TYPE) => { run: (x: string, y?: string) => WS_TRIGGER_H_RUN_RETURN_TYPE },
    },
    /* trigger method(s) on one client */
    useClient: (x: string) => {
        trigger: (x?: TASK_EXECUTION_TYPE) => { run: (x: string, y?: string) => WS_TRIGGER_H_RUN_RETURN_TYPE },
    },
    /* trigger method(s) on many clients or servers */
    broadcast: (x: 'to_clients' | 'to_servers') => {
        trigger: (x?: TASK_EXECUTION_TYPE) => { run: (x: string, y?: string) => WS_TRIGGER_H_BROADCAST_RUN_RETURN_TYPE },
    }
};





/* - */
type FS_X_FILE_ARG_TYPE = { path?: string, content?: any, overwrite?: boolean };
type FS_X_FOLDER_ARG_TYPE = { path: string, files?: { name: string, content: any } | { name: string, content: any }[] };
/* - */
type FS_READ_FILE_ARG_TYPE = { id: string, path: string };
type FS_READ_FOLDER_ARG_TYPE = { id: string, path: string, target?: 'files' | 'folders' | 'all' };
/* - */
type FS_RENAME_X_ARG_TYPE = { path: string, newName: string };
/* - */
type FS_MOVE_X_ARG_TYPE = { from: string, to: string };
/* - */
type FS_COPY_X_ARG_TYPE = { from: string, to: string /* , overwrite?: boolean */ };
/* - */
type FS_CLEAR_FOLDER_ARG_TYPE = { path: string, target?: 'files' | 'folders' | 'all' };
/* - */
type FS_RETURN_TYPE = {
    // /* if */
    // if: (x: JSON_BASIC_TYPE) => FS_IF_COND_RETURN_TYPE,

    // /* else if */
    // elsif: (x: JSON_BASIC_TYPE) => FS_ELSIF_COND_RETURN_TYPE,

    // /* else */
    // else: (x: JSON_BASIC_TYPE) => FS_ELSE_COND_RETURN_TYPE,

    /* Create */
    create: () => {
        folder: (x: FS_X_FOLDER_ARG_TYPE | FS_X_FOLDER_ARG_TYPE[]) => Promise<FUNCTION_BASIC_RETURN_TYPE>,
        file: (x: FS_X_FILE_ARG_TYPE | FS_X_FILE_ARG_TYPE[]) => Promise<FUNCTION_BASIC_RETURN_TYPE>
    },

    /* write or Update files */
    write: () => {
        file: (x: FS_X_FILE_ARG_TYPE | FS_X_FILE_ARG_TYPE[]) => Promise<FUNCTION_BASIC_RETURN_TYPE>
    },

    /* Read */
    read: () => {
        folder: (x: FS_READ_FOLDER_ARG_TYPE | FS_READ_FOLDER_ARG_TYPE[]) => Promise<FUNCTION_BASIC_RETURN_TYPE>,
        file: (x: FS_READ_FILE_ARG_TYPE | FS_READ_FILE_ARG_TYPE[]) => Promise<FUNCTION_BASIC_RETURN_TYPE>
    },

    /* Delete */
    delete: () => {
        folder: (x: string | string[]) => Promise<FUNCTION_BASIC_RETURN_TYPE>,
        file: (x: string | string[]) => Promise<FUNCTION_BASIC_RETURN_TYPE>
    },

    /* Rename */
    rename: () => {
        folder: (x: FS_RENAME_X_ARG_TYPE | FS_RENAME_X_ARG_TYPE[]) => Promise<FUNCTION_BASIC_RETURN_TYPE>,
        file: (x: FS_RENAME_X_ARG_TYPE | FS_RENAME_X_ARG_TYPE[]) => Promise<FUNCTION_BASIC_RETURN_TYPE>
    },

    /* Move */
    move: () => {
        folder: (x: FS_MOVE_X_ARG_TYPE | FS_MOVE_X_ARG_TYPE[]) => Promise<FUNCTION_BASIC_RETURN_TYPE>,
        file: (x: FS_MOVE_X_ARG_TYPE | FS_MOVE_X_ARG_TYPE[]) => Promise<FUNCTION_BASIC_RETURN_TYPE>
    },

    /* Copy */
    copy: () => {
        folder: (x: FS_COPY_X_ARG_TYPE | FS_COPY_X_ARG_TYPE[]) => Promise<FUNCTION_BASIC_RETURN_TYPE>,
        file: (x: FS_COPY_X_ARG_TYPE | FS_COPY_X_ARG_TYPE[]) => Promise<FUNCTION_BASIC_RETURN_TYPE>
    },

    /* Clear */
    clear: () => {
        folder: (x: FS_CLEAR_FOLDER_ARG_TYPE | FS_CLEAR_FOLDER_ARG_TYPE[]) => Promise<FUNCTION_BASIC_RETURN_TYPE>,
        file: (x: string | string[]) => Promise<FUNCTION_BASIC_RETURN_TYPE>
    }
};

/* Types for fs methods */

type FS_METHOD_TYPE = 'folder' | 'file';





type HTTP_TRIGGER_H_RUN_FUNC_TYPE = { name: string, alias: string, args: any[] };
type HTTP_TRIGGER_H_WITH_ARG_TYPE = {
    run: (x: string, y?: string) => HTTP_TRIGGER_H_RUN_RETURN_TYPE,
    fromId: (x: string) => Promise<FUNCTION_BASIC_RETURN_TYPE>,
    fromFamily: (x: string) => Promise<FUNCTION_BASIC_RETURN_TYPE>
};
type HTTP_TRIGGER_H_RUN_RETURN_TYPE = {
    withArgs: (...x: any) => HTTP_TRIGGER_H_WITH_ARG_TYPE,
    // fromId: (x: string) => Promise<FUNCTION_BASIC_RETURN_TYPE>,
    // fromFamily: (x: string) => Promise<FUNCTION_BASIC_RETURN_TYPE>
};
type HTTP_RETURN_TYPE = {
    useServer: (x: string) => {
        trigger: (x?: TASK_EXECUTION_TYPE) => { run: (x: string, y?: string) => HTTP_TRIGGER_H_RUN_RETURN_TYPE },
        // upload: () => Promise<any>, /* TODO :: */
        // download: () => Promise<any>, /* TODO :: */
    }
};











