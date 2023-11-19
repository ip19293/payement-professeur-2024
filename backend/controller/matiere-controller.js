const APIFeatures = require("../utils/apiFeatures");
const Matiere = require("../models/matiere");
const Professeur = require("../models/professeur");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Categorie = require("../models/categorie");
exports.getMatieres = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.id) filter = { cours: req.params.id };
  const features = new APIFeatures(
    Matiere.find().sort({ numero: 1 }),
    /* .populate({
      path: "categorie",
    }) */ req.query
  )
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const matieres_list = await features.query;
  let matieres = [];
  for (x of matieres_list) {
    let matiere_info = await x.getInformation();
    let data = {
      _id: x._id,
      name: x.name,
      description: x.description,
      categorie: x.categorie,
      categorie_name: matiere_info[1],
      code: matiere_info[2],
      taux: matiere_info[3],
      numero: x.numero,
    };
    matieres.push(data);
  }

  res.status(200).json({
    status: "success",
    matieres,
  });
});
exports.deleteAllMatieres = catchAsync(async (req, res, next) => {
  await Matiere.deleteMany();
  res.status(200).json({
    status: "success",
    message: "all matieres is deleted",
  });
});
exports.getMatieresProf = catchAsync(async (req, res, next) => {
  let filter = {};
  const professeurs = await Professeur.find({
    matieres: req.params.id,
  });

  res.status(200).json({
    status: "success",

    professeurs,
  });
});
/* =================================================================ADD ============================ */
exports.addMatiere = catchAsync(async (req, res, next) => {
  const data = req.body;
  const categorie = await Categorie.findById(req.body.categorie);
  if (!categorie) {
    return next(new AppError("No categorie found with this ID ...", 404));
  }
  const Oldmatiere = await Matiere.findOne({ name: req.body.name });
  if (Oldmatiere) {
    return next(new AppError("This matiere was existe before ...", 404));
  }
  const matiere = new Matiere({
    name: req.body.name,
    description: req.body.description,
    categorie: req.body.categorie,
  });
  await matiere.save();
  res.status(200).json({
    status: "success",
    matiere: matiere,
  });
});
/* ======================================================================EDIT ========================= */
exports.updateMatiere = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const categorie = await Categorie.findById(req.body.categorie);
  if (!categorie) {
    return next(new AppError("No categorie found with this ID ...", 404));
  }
  const Oldmatiere = await Matiere.findOne({ name: req.body.name });
  if (Oldmatiere && !Oldmatiere._id.equals(id)) {
    return next(new AppError("This matiere was existe before ...", 404));
  }

  const matiere = await Matiere.findById(id);
  matiere.name = req.body.name;
  matiere.categorie = req.body.categorie;
  matiere.description = req.body.description;
  await matiere.save();
  if (!matiere) {
    return next(new AppError("No Matiere found with that ID", 404));
  }
  res.status(201).json({
    status: "success",
    matiere,
  });
});

exports.deleteMatiere = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const matiere = await Matiere.findOneAndDelete(id);
  if (!matiere) {
    return next(new AppError("No Matiere found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    message: matiere.name,
  });
});
exports.getMatiere = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const matiere = await Matiere.findById(id).populate([
    {
      path: "categorie",
      select: "prix name",
    },
  ]);
  if (!matiere) {
    return next(new AppError("No Matiere found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    matiere,
  });
});
/* ==========================GET ALL PROFESSEURS MATIERE ============================================ */
exports.getAllProfesseursByMatiereId = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const matiere = await Matiere.findByIdAndDelete(id);
  if (!matiere) {
    return next(new AppError("No Matiere found with that ID", 404));
  }

  const professeurs = await Professeur.find([
    {
      matieres: id,
    },
  ]);
  res.status(200).json({
    status: "success",
    professeurs,
  });
});
