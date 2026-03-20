// Central registry for available creation types.
// This module aggregates metadata from each specific type folder.

import * as Novel from './Novel';
import * as Play from './Play';
import * as Screenplay from './Screenplay';
import * as PoetryCollection from './PoetryCollection';
import * as ShortStory from './ShortStory';
import * as CreativeNonFiction from './CreativeNonFiction';
import * as SongLyrics from './SongLyrics';
import * as ComicBookScript from './ComicBookScript';
import * as CreativeJournal from './CreativeJournal';
import * as MythologyCreation from './MythologyCreation';
import * as ScientificTheory from './ScientificTheory';
import * as PhilosophicalTreatise from './PhilosophicalTreatise';
import * as LabJournal from './LabJournal';
import * as OperatingSystem from './OperatingSystem';
import * as Codebase from './Codebase';
import * as VideoGame from './VideoGame';
import * as ArtProject from './ArtProject';
import * as FilmConcept from './FilmConcept';
import * as Anthology from './Anthology';
import * as ExperimentalWorks from './ExperimentalWorks';

export const TYPES = [
    Novel,
    Play,
    Screenplay,
    PoetryCollection,
    ShortStory,
    CreativeNonFiction,
    SongLyrics,
    ComicBookScript,
    CreativeJournal,
    MythologyCreation,
    ScientificTheory,
    PhilosophicalTreatise,
    LabJournal,
    OperatingSystem,
    Codebase,
    VideoGame,
    ArtProject,
    FilmConcept,
    Anthology,
    ExperimentalWorks
];

export default {
    Novel,
    Play,
    Screenplay,
    PoetryCollection,
    ShortStory,
    CreativeNonFiction,
    SongLyrics,
    ComicBookScript,
    CreativeJournal,
    MythologyCreation,
    ScientificTheory,
    PhilosophicalTreatise,
    LabJournal,
    OperatingSystem,
    Codebase,
    VideoGame,
    ArtProject,
    FilmConcept,
    Anthology,
    ExperimentalWorks
};

// Optionally, each item in TYPES could be typed to a specific interface in the future.