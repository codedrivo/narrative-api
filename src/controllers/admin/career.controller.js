const catchAsync = require('../../helpers/asyncErrorHandler');
const service = require('../../services/admin/career.service');

const getCareer = catchAsync(async (req, res) => {
  const limit = req.params.limit ? Number(req.params.limit) : 10;
  const page = req.params.page ? Number(req.params.page) : 1;
  const search = req.query.search ? req.query.search : '';
  const getCareer = await service.getCareers(page, limit, search);
  res.status(200).send(getCareer);
});

const getCareerListWithoutPagination = catchAsync(async (req, res) => {
  const careerList = await service.careerList();
  res.status(200).send(careerList);
});

const addCareer = catchAsync(async (req, res) => {
  const data = { ...req.body };
  if (req.file && req.file.location) {
    data.careerLogo = req.file.location;
  }
  const careerData = await service.addCareer(data);
  res.status(200).json({
    status: 200,
    message: 'Career added successfully',
    careerData: careerData,
  });
});

const editCareer = catchAsync(async (req, res) => {
  const careerData = await service.editCareer(req.params.id);
  res.status(200).send({ status: 200, careerData: careerData });
});

const updateCareer = catchAsync(async (req, res) => {
  const id = req.params.id;
  const data = { ...req.body };

  if (req.file && req.file.location) {
    data.careerLogo = req.file.location;
  }
  const updateData = await service.updateCareer(id, data);

  res.status(200).json({
    status: 200,
    message: 'Career updated successfully',
    careerData: updateData,
  });
});

const deleteCareer = catchAsync(async (req, res) => {
  await service.deleteCareer(req.params.id);
  res.status(200).send({ status: 200, message: 'Career deleted successfully' });
});

// search career
const searchCareer = catchAsync(async (req, res) => {
  const results = await service.searchCareer();
  res.status(200).send({ status: 200, message: 'Success!', results });
});

module.exports = {
  getCareer,
  addCareer,
  updateCareer,
  editCareer,
  deleteCareer,
  searchCareer,
  getCareerListWithoutPagination
};
